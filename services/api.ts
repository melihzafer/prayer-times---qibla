import { Coordinates, AladhanApiResponse, NominatimResult } from '../types';

const ALADHAN_API_URL = 'https://api.aladhan.com/v1/timings';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const HADITH_API_URL = 'https://random-hadith-generator.vercel.app/bukhari/';

export async function fetchPrayerTimesByCoords(coords: Coordinates, method: number, date: Date) {
  const { latitude, longitude } = coords;
  const dateString = date.toISOString().split('T')[0];
  // Using ar.alafasy edition to get arabic month/weekday names in the response
  const url = `${ALADHAN_API_URL}/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${method}&edition=ar.alafasy`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prayer times');
  }
  const data: AladhanApiResponse = await response.json();
  if (data.code !== 200) {
      throw new Error(data.status);
  }
  return data.data;
}

export async function fetchCoordsByCity(city: string) {
  const url = `${NOMINATIM_API_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`;
  
  const response = await fetch(url, {
      headers: {
          'User-Agent': 'PrayerTimesPWA/1.0 (https://yourapp.com)'
      }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch city data');
  }
  const data: NominatimResult[] = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    const cityName = display_name.split(',')[0];
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      city: cityName,
    };
  }
  return null;
}

export async function fetchHadithOfTheDay() {
  const response = await fetch(HADITH_API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch Hadith of the Day');
  }
  const result = await response.json();
  return result.data;
}

// --- Gemini API Services (Backend-Only) ---
// These functions call secure backend endpoints where the API key is stored server-side.
// The GEMINI_API_KEY is NEVER exposed to the client.

// Use relative URLs when VITE_API_URL is empty (in development with Vite proxy)
// Otherwise use the configured API URL (for production)
const getApiBaseUrl = (): string => {
  const configuredUrl = (import.meta as any).env?.VITE_API_URL;
  return configuredUrl ? String(configuredUrl) : '';
};

const API_BASE_URL = getApiBaseUrl();

const buildApiUrl = (endpoint: string): string => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Development mode: use relative URL (proxied through Vite)
  return endpoint;
};

// Cache for API availability (simple check)
let cachedAvailable: boolean | null = null;
let lastCheckTime = 0;

export const isGeminiAvailable = () => {
  // Return cached value if fresh (within 5 seconds)
  if (cachedAvailable !== null && Date.now() - lastCheckTime < 5000) {
    return cachedAvailable;
  }
  
  // Default to true - assume available unless proven otherwise
  // This allows features to show immediately
  return true;
};

// Background check for actual availability
export const checkGeminiAvailabilityInBackground = async () => {
  try {
    const response = await fetch(buildApiUrl('/health'));
    const data = await response.json();
    cachedAvailable = data.geminiAvailable === true;
    lastCheckTime = Date.now();
  } catch {
    cachedAvailable = false;
    lastCheckTime = Date.now();
  }
};

// Run background check on app load
if (typeof window !== 'undefined') {
  checkGeminiAvailabilityInBackground();
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/translate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { translatedText } = await response.json();
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please ensure the backend API is running.');
  }
}

export async function findNearbyMosques(coords: Coordinates): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/nearby-mosques'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Nearby mosques error:', error);
    throw new Error('Failed to find nearby mosques. Please ensure the backend API is running.');
  }
}

export async function getEventInformation(eventName: string, languageCode: string = 'en'): Promise<any> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/event-info'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, languageCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Event information error:', error);
    throw new Error('Failed to get event information. Please ensure the backend API is running.');
  }
}

export async function getNameInformation(name: string, meaning: string, languageCode: string = 'en'): Promise<string> {
  try {
    const response = await fetch(buildApiUrl('/api/gemini/name-info'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, meaning, languageCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { information } = await response.json();
    return information;
  } catch (error) {
    console.error('Name information error:', error);
    throw new Error('Failed to get name information. Please ensure the backend API is running.');
  }
}