import { useState, useEffect, useCallback } from 'react';

type PermissionState = 'granted' | 'denied' | 'prompt';

interface DeviceOrientation {
  heading: number | null;
  permissionState: PermissionState;
  requestPermission: () => Promise<void>;
  error: keyof typeof translations['en'] | null;
}

// A minimal self-contained translator for this hook's specific error messages
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


export const useDeviceOrientation = (): DeviceOrientation => {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<keyof typeof translations['en'] | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    console.log('🧭 Device Orientation Event:', { alpha: event.alpha, beta: event.beta, gamma: event.gamma });
    
    // webkitCompassHeading is for iOS Safari (0-360, where 0 is North)
    const compassHeading = (event as any).webkitCompassHeading;
    if (typeof compassHeading !== 'undefined' && compassHeading !== null) {
      console.log('📱 iOS Compass Heading:', compassHeading);
      setHeading(compassHeading);
      return;
    }
    
    // Standard alpha property (0-360)
    // On Android: 0 = North, 90 = East, 180 = South, 270 = West
    // We want: 0 = North when facing North, so heading = alpha
    if (event.alpha !== null && event.alpha !== undefined) {
      console.log('📱 Android Alpha:', event.alpha);
      setHeading(event.alpha);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log('🔐 Requesting device orientation permission...');
    
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('✅ Permission response:', permission);
        
        if (permission === 'granted') {
          setPermissionState('granted');
          console.log('✅ Permission granted! Adding device orientation listener...');
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionState('denied');
          setError('permissionDenied');
          console.warn('❌ Permission denied');
        }
      } catch (err) {
        console.error('❌ Permission request error:', err);
        setPermissionState('denied');
      }
    } else {
      console.log('ℹ️ requestPermission not available. Using standard API...');
      if ('DeviceOrientationEvent' in window) {
        setPermissionState('granted');
        console.log('✅ DeviceOrientationEvent supported! Adding listener...');
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        setError('compassNotSupported');
        console.error('❌ Device orientation not supported');
      }
    }
  }, [handleOrientation]);

  useEffect(() => {
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  return { heading, permissionState, requestPermission, error };
};
