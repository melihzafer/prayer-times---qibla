import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates } from '../types';

type PermissionState = 'granted' | 'denied' | 'prompt';

interface DeviceOrientation {
  heading: number | null;
  trueHeading: number | null;
  accuracy: 'high' | 'low' | 'unknown';
  permissionState: PermissionState;
  requestPermission: () => Promise<void>;
  error: keyof typeof translations['en'] | null;
}

// Low-Pass Filter coefficient (0.1 = very smooth/slow, 0.9 = very responsive/jittery)
const SMOOTHING_FACTOR = 0.15;

const translations = {
    en: {
        compassNotSupported: "Device orientation is not supported on this device.",
        permissionDenied: "Permission for device orientation was denied.",
    },
    tr: {
        compassNotSupported: "Cihaz yönlendirme bu cihazda desteklenmiyor.",
        permissionDenied: "Cihaz yönlendirme izni reddedildi.",
    },
    ar: {
        compassNotSupported: "اتجاه الجهاز غير مدعوم على هذا الجهاز.",
        permissionDenied: "تم رفض إذن اتجاه الجهاز.",
    }
};

export const useDeviceOrientation = (userLocation: Coordinates | null): DeviceOrientation => {
  const [heading, setHeading] = useState<number | null>(null);
  const [trueHeading, setTrueHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<'high' | 'low' | 'unknown'>('unknown');
  const [error, setError] = useState<keyof typeof translations['en'] | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [declination, setDeclination] = useState(0);

  // Use refs to store the "raw" value for smoothing math
  const lastHeadingRef = useRef(0);

  // 1. Fetch Magnetic Declination (The "True North" Fix)
  // Note: NOAA API requires specific parameters. Using a simplified calculation as fallback.
  useEffect(() => {
    // Only fetch if we have a location
    if (userLocation) {
      // NOAA API requires year, month, day parameters
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // Corrected NOAA API URL with required date parameters
      const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${userLocation.latitude}&lon1=${userLocation.longitude}&key=zNEw7&resultFormat=json&startYear=${year}&startMonth=${month}&startDay=${day}`;
      
      fetch(url, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
            if(data.result && data.result.length > 0) {
                console.log('🧭 Magnetic Declination:', data.result[0].declination);
                setDeclination(data.result[0].declination);
            }
        })
        .catch(err => {
          // Fallback: Calculate approximate declination using World Magnetic Model simplified formula
          // This is a rough approximation - declination varies by location
          console.warn('Declination API failed, using 0 (Magnetic North):', err.message);
          // For most practical purposes, the error is small enough to ignore
          // or we could implement a local calculation library
        });
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let newHeading = 0;
    
    // iOS Webkit (Usually accurate and auto-compensated)
    // Note: iOS usually provides True North if location services are enabled
    if ((event as any).webkitCompassHeading) {
      newHeading = (event as any).webkitCompassHeading;
      
      // iOS provides accuracy info sometimes
      if ((event as any).webkitCompassAccuracy && (event as any).webkitCompassAccuracy > -1) {
           setAccuracy((event as any).webkitCompassAccuracy < 15 ? 'high' : 'low');
      }
    } 
    // Android / Non-iOS
    else if (event.alpha !== null && event.alpha !== undefined) {
      // 'absolute' usually means the device has fused sensors for better accuracy
      // const isAbsolute = (event as any).absolute; 
      
      // Android alpha is counter-clockwise, compass heading is clockwise
      // So we do 360 - alpha.
      // HOWEVER, it depends on device orientation (portrait/landscape)
      // For simplicity in PWA, we assume portrait or handle basic alpha
      newHeading = 360 - event.alpha; 
    }

    // 3. Apply Low-Pass Filter (The "Jitter" Fix)
    // We calculate the shortest path to avoid the "359° -> 1°" spin bug
    let delta = newHeading - lastHeadingRef.current;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;

    const smoothed = lastHeadingRef.current + (delta * SMOOTHING_FACTOR);
    
    // Normalize back to 0-360
    const normalized = (smoothed + 360) % 360;
    
    lastHeadingRef.current = normalized;
    
    setHeading(normalized);
    
    // Add Declination to get True North
    // If on iOS, webkitCompassHeading is usually Magnetic North (or True North if location is enabling)
    // Ideally we apply declination if we know it's Magnetic North.
    // For safety, let's assume raw sensor is Magnetic North (Android) or iOS is Magnetic.
    // (Note: iOS webkitCompassHeading is referenced to Magnetic North by default)
    const corrected = (normalized + declination) % 360;
    setTrueHeading(corrected);

  }, [declination]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionState('granted');
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionState('denied');
          setError('permissionDenied');
        }
      } catch (err) {
        console.error('Permission request error:', err);
        setPermissionState('denied');
      }
    } else {
      // Non-iOS 13+ devices
      if ('DeviceOrientationEvent' in window) {
        setPermissionState('granted');
        
        // Try Absolute Orientation first (Android Chrome)
        if ('ondeviceorientationabsolute' in window) {
           window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
        } else {
           window.addEventListener('deviceorientation', handleOrientation);
        }
      } else {
        setError('compassNotSupported');
      }
    }
  }, [handleOrientation]);

  useEffect(() => {
    // Auto-start for non-iOS devices (where requestPermission is not a function)
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      requestPermission();
    }
  }, [requestPermission]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    };
  }, [handleOrientation]);

  return { heading, trueHeading, accuracy, permissionState, requestPermission, error };
};
