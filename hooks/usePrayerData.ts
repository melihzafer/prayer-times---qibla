import { useState, useEffect, useCallback } from 'react';
import { Coordinates, PrayerTimes, HijriDate, NextPrayer, UserProfile } from '../types';
import { fetchPrayerTimesByCoords, fetchCoordsByCity } from '../services/api';
import { calculateQiblaDirection, findNextPrayer, formatCountdown } from '../utils/helpers';

interface PrayerDataState {
  loading: string | false;
  error: string | null;
  coordinates: Coordinates | null;
  city: string;
  prayerTimes: PrayerTimes | null;
  hijriDate: HijriDate | null;
  nextPrayer: NextPrayer | null;
  countdown: string;
  qiblaDirection: number | null;
  method: number;
  theme: 'light' | 'dark';
  language: string;
  selectedDate: Date;
  user: UserProfile;
  notification: { prayerName: string, time: string } | null;
  lastNotifiedTime: string | null;
}

// Helper to get initial value from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  const item = window.localStorage.getItem(key);
  if (item === null) {
    return defaultValue;
  }

  try {
    // First, try to parse as JSON (new format)
    return JSON.parse(item);
  } catch (error) {
    // If parsing fails, it might be the old raw string format
    // This is especially for the 'theme' key for backward compatibility
    if (key === 'theme' && (item === 'light' || item === 'dark')) {
      console.warn(`Found legacy theme value "${item}" in localStorage. It will be updated to JSON format on the next theme change.`);
      return item as T;
    }
    
    console.error(`Error reading from localStorage key “${key}”:`, error);
    // For other malformed data, return the default to prevent crashes
    return defaultValue;
  }
};

export const usePrayerData = () => {
  const [state, setState] = useState<PrayerDataState>({
    loading: false,
    error: null,
    coordinates: getInitialState<Coordinates | null>('coordinates', null),
    city: getInitialState<string>('city', ''),
    prayerTimes: null,
    hijriDate: null,
    nextPrayer: null,
    countdown: '00:00:00',
    qiblaDirection: null,
    method: getInitialState<number>('method', 3),
    theme: getInitialState<'light' | 'dark'>('theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    language: getInitialState<string>('language', 'en'),
    selectedDate: new Date(),
    user: getInitialState('userProfile', { isLoggedIn: false, name: 'Guest', notificationPrefs: {} }),
    notification: null,
    lastNotifiedTime: null,
  });

  const updateState = (newState: Partial<PrayerDataState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };
  
  const fetchAndSetPrayerTimes = useCallback(async (coords: Coordinates, calcMethod: number, date: Date) => {
    updateState({ loading: 'Loading prayer times...', error: null, prayerTimes: null, hijriDate: null });
    
    const dateString = date.toISOString().split('T')[0];
    const cacheKey = `prayerTimes-${coords.latitude.toFixed(2)}-${coords.longitude.toFixed(2)}-${calcMethod}-${dateString}`;
    const cachedData = getInitialState<{ timestamp: number, data: any } | null>(cacheKey, null);
    
    if (cachedData) {
      updateState({
        prayerTimes: cachedData.data.timings,
        hijriDate: cachedData.data.date.hijri,
        loading: false,
      });
      return;
    }

    try {
      const data = await fetchPrayerTimesByCoords(coords, calcMethod, date);
      updateState({
        prayerTimes: data.timings,
        hijriDate: data.date.hijri,
      });
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (err) {
      updateState({ error: 'Failed to fetch prayer times. Please try again.' });
    } finally {
      updateState({ loading: false });
    }
  }, []);

  useEffect(() => {
    if (state.coordinates) {
      fetchAndSetPrayerTimes(state.coordinates, state.method, state.selectedDate);
      if (!state.qiblaDirection) {
        updateState({ qiblaDirection: calculateQiblaDirection(state.coordinates) });
      }
      localStorage.setItem('coordinates', JSON.stringify(state.coordinates));
      localStorage.setItem('city', JSON.stringify(state.city));
    }
  }, [state.coordinates, state.method, state.city, state.selectedDate, fetchAndSetPrayerTimes]);

  useEffect(() => {
    if (!state.prayerTimes) return;

    const isToday = new Date().toDateString() === state.selectedDate.toDateString();
    if (!isToday) {
        updateState({ nextPrayer: null, countdown: '00:00:00' });
        return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const nextPrayerInfo = findNextPrayer(state.prayerTimes!, now);
      updateState({ 
          nextPrayer: nextPrayerInfo,
          countdown: nextPrayerInfo ? formatCountdown(nextPrayerInfo.time, now, nextPrayerInfo.isNextDay) : '00:00:00'
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.prayerTimes, state.selectedDate]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(state.theme === 'dark' ? 'light' : 'dark');
    root.classList.add(state.theme);
    localStorage.setItem('theme', JSON.stringify(state.theme));
  }, [state.theme]);

   // Effect for checking notifications
  useEffect(() => {
    if (!state.prayerTimes) return;

    const checkNotifications = () => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        // Prevent duplicate notifications in the same minute
        if (state.lastNotifiedTime === currentTime) {
          return;
        }
        
        for (const prayerName in state.user.notificationPrefs) {
            if (state.user.notificationPrefs[prayerName] && state.prayerTimes && state.prayerTimes[prayerName] === currentTime) {
                // Trigger In-App Toast
                updateState({ notification: { prayerName, time: state.prayerTimes[prayerName] }, lastNotifiedTime: currentTime });
                
                // Trigger System Notification if permitted
                if (Notification.permission === "granted") {
                    new Notification(`Time for ${prayerName}`, {
                        body: `It is now time for ${prayerName} prayer (${state.prayerTimes[prayerName]})`,
                        icon: '/favicon.svg' // Assuming favicon exists
                    });
                }
            }
        }
    };
    
    // Check every 10 seconds to catch the notification window
    const interval = setInterval(checkNotifications, 10 * 1000);
    // Run once on load
    checkNotifications();

    return () => clearInterval(interval);
  }, [state.prayerTimes, state.user.notificationPrefs, state.lastNotifiedTime]);

  const handleSearch = async (query: string) => {
    updateState({ loading: `Searching for ${query}...`, error: null });
    try {
      const result = await fetchCoordsByCity(query);
      if (result) {
        updateState({
          coordinates: { latitude: result.latitude, longitude: result.longitude },
          city: result.city,
          selectedDate: new Date(), // Reset to today on new search
        });
      } else {
        updateState({ error: `Could not find city: ${query}` });
      }
    } catch (err) {
      updateState({ error: 'Failed to search for city. Check your connection.' });
    }
    updateState({ loading: false });
  };

  const requestLocation = () => {
    updateState({ loading: 'Fetching location...', error: null });
    
    if (!navigator.geolocation) {
      updateState({ loading: false, error: 'Geolocation is not supported by your browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Got precise location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
        
        updateState({ 
          coordinates: { latitude, longitude }, 
          city: 'Current Location',
          selectedDate: new Date(),
          loading: false,
        });
        
        // Try to reverse geocode to get city name
        try {
          const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
          const response = await fetch(reverseGeoUrl, {
            headers: { 'User-Agent': 'PrayerTimesPWA/1.0' }
          });
          const data = await response.json();
          if (data.address) {
            // Try to get town/city name, fallback to county, then region
            const cityName = data.address.town || data.address.city || data.address.county || data.address.region || 'Current Location';
            console.log(`🏙️ City: ${cityName}`);
            updateState({ city: cityName });
            localStorage.setItem('city', JSON.stringify(cityName));
          }
        } catch (err) {
          console.warn('Could not reverse geocode:', err);
          // Keep "Current Location" as fallback
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMsg = 'Location access denied. Please enable it in your browser settings.';
        if (err.code === 3) { // TIMEOUT
          errorMsg = 'Location request timed out. Please try again.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMsg = 'Could not determine your location. Please check your connection.';
        }
        updateState({ loading: false, error: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  
  const setMethod = (methodId: number) => {
    updateState({ method: methodId });
    localStorage.setItem('method', JSON.stringify(methodId));
  };
  
  const toggleTheme = () => {
    updateState({ theme: state.theme === 'light' ? 'dark' : 'light' });
  };
  
  const setLanguage = (lang: string) => {
    updateState({ language: lang });
    localStorage.setItem('language', JSON.stringify(lang));
  }

  const goToPreviousDay = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    updateState({ selectedDate: newDate });
  };

  const goToNextDay = () => {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    updateState({ selectedDate: newDate });
  };

  const login = () => {
    const newProfile = { ...state.user, isLoggedIn: true };
    updateState({ user: newProfile });
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const logout = () => {
    const newProfile = { ...state.user, isLoggedIn: false };
    updateState({ user: newProfile });
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const togglePrayerNotification = (prayerName: string) => {
    const isEnabling = !state.user.notificationPrefs[prayerName];
    
    if (isEnabling && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    const newPrefs = { ...state.user.notificationPrefs, [prayerName]: isEnabling };
    const newProfile = { ...state.user, notificationPrefs: newPrefs };
    updateState({ user: newProfile });
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const clearNotification = () => {
    updateState({ notification: null });
  };
  
  return {
    state,
    actions: {
        handleSearch,
        requestLocation,
        setMethod,
        toggleTheme,
        setLanguage,
        goToPreviousDay,
        goToNextDay,
        login,
        logout,
        togglePrayerNotification,
        clearNotification,
    }
  };
};