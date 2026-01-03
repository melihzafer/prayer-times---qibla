import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, Mosque } from '../types';

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// Overpass API endpoint (free, no API key needed!)
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

interface MosqueFinderState {
  mosques: Mosque[];
  loading: boolean;
  error: string | null;
}

/**
 * Get cached mosques from localStorage
 */
const getCachedMosques = (coords: Coordinates): Mosque[] | null => {
  const cacheKey = `mosqueCache-${coords.latitude.toFixed(2)}-${coords.longitude.toFixed(2)}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return null;
  
  try {
    const { timestamp, mosques } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      console.log('🕌 [Cache] Using cached mosque data');
      return mosques;
    }
    // Cache expired
    localStorage.removeItem(cacheKey);
  } catch (e) {
    localStorage.removeItem(cacheKey);
  }
  
  return null;
};

/**
 * Save mosques to localStorage cache
 */
const cacheMosques = (coords: Coordinates, mosques: Mosque[]): void => {
  const cacheKey = `mosqueCache-${coords.latitude.toFixed(2)}-${coords.longitude.toFixed(2)}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      mosques
    }));
  } catch (e) {
    console.warn('🕌 [Cache] Failed to cache mosques:', e);
  }
};

/**
 * Calculate distance between two coordinates in km
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Hook to find nearby mosques using OpenStreetMap Overpass API (FREE!)
 * Falls back to cached data or returns empty if API unavailable
 */
export const useMosqueFinder = (userLocation: Coordinates | null) => {
  const [state, setState] = useState<MosqueFinderState>({
    mosques: [],
    loading: false,
    error: null
  });
  
  const hasSearchedRef = useRef(false);

  const searchMosques = useCallback(async () => {
    if (!userLocation) {
      setState(prev => ({ ...prev, error: 'Location not available' }));
      return;
    }

    // Check cache first
    const cached = getCachedMosques(userLocation);
    if (cached) {
      setState({ mosques: cached, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { latitude, longitude } = userLocation;
      const radius = 5000; // 5km radius

      // Overpass QL query to find mosques
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
          node["building"="mosque"](around:${radius},${latitude},${longitude});
          way["building"="mosque"](around:${radius},${latitude},${longitude});
        );
        out center tags;
      `;

      console.log('🕌 [Overpass API] Searching for mosques...');
      
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse OSM elements into Mosque format
      const formatted: Mosque[] = data.elements
        .map((element: any) => {
          // Get coordinates (for ways, use center point)
          const lat = element.lat || element.center?.lat;
          const lng = element.lon || element.center?.lon;
          
          if (!lat || !lng) return null;

          const tags = element.tags || {};
          const name = tags.name || tags['name:en'] || tags['name:ar'] || 'Mosque';
          
          // Build address from available tags
          const addressParts = [
            tags['addr:street'],
            tags['addr:housenumber'],
            tags['addr:city'],
          ].filter(Boolean);
          const address = addressParts.length > 0 
            ? addressParts.join(', ') 
            : tags.address || '';

          const distance = calculateDistance(latitude, longitude, lat, lng);

          return {
            id: `osm-${element.id}`,
            name,
            address,
            distance: `${distance.toFixed(1)} km`,
            location: { lat, lng },
            // OSM doesn't have ratings, but we include the type
            osmType: element.type,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 15); // Limit to 15 results

      // Cache results
      cacheMosques(userLocation, formatted);

      setState({
        mosques: formatted,
        loading: false,
        error: null
      });
      
      console.log(`🕌 [Overpass API] Found ${formatted.length} mosques`);
    } catch (err) {
      console.error('🕌 [Overpass API] Exception:', err);
      setState({
        mosques: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to search for mosques'
      });
    }
  }, [userLocation]);

  // Auto-search when location is available (but only once)
  useEffect(() => {
    if (userLocation && !hasSearchedRef.current) {
      hasSearchedRef.current = true;
      searchMosques();
    }
  }, [userLocation, searchMosques]);

  // Reset search flag when location changes significantly
  useEffect(() => {
    hasSearchedRef.current = false;
  }, [userLocation?.latitude?.toFixed(2), userLocation?.longitude?.toFixed(2)]);

  return {
    ...state,
    refetch: searchMosques
  };
};

/**
 * Open Google Maps with directions to a specific location (FREE for user!)
 */
export const openDirectionsInMaps = (lat: number, lng: number, name?: string): void => {
  // Google Maps directions URL - free for users, opens in Google Maps app
  const destination = `${lat},${lng}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Open a specific location in Google Maps
 */
export const openLocationInMaps = (lat: number, lng: number, name?: string): void => {
  const query = name ? encodeURIComponent(name) : `${lat},${lng}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Open Google Maps with "mosques near me" search (free fallback)
 */
export const openMosquesNearMe = (): void => {
  const url = 'https://www.google.com/maps/search/mosques+near+me';
  window.open(url, '_blank', 'noopener,noreferrer');
};
