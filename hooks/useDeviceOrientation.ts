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
    console.log('🧭 Device Orientation Event:', { alpha: event.alpha, beta: event.beta, gamma: event.gamma, absolute: (event as any).absolute });
    
    // webkitCompassHeading is for iOS Safari (0-360, where 0 is North)
    const compassHeading = (event as any).webkitCompassHeading;
    if (typeof compassHeading !== 'undefined' && compassHeading !== null) {
      console.log('📱 iOS Compass Heading:', compassHeading);
      setHeading(compassHeading);
      return;
    }
    
    // For Android/Chrome: Use alpha, but only when phone is held upright
    // Beta values:
    //   0° = phone flat (camera pointing at sky) - BAD, freeze
    //   90° = phone upright (camera pointing forward) - GOOD, use
    //   180° = phone upside down flat - BAD, freeze
    if (event.alpha !== null && event.alpha !== undefined) {
      const beta = event.beta ?? 0;
      
      // Only update when phone is held somewhat upright (beta between 30° and 150°)
      // This is the "camera pointing forward" zone
      // Freeze when pointing at sky (beta < 30) or ground (beta > 150)
      if (beta > 30 && beta < 150) {
        // Use alpha directly - test without inversion
        const heading = event.alpha;
        
        console.log('📱 Heading:', heading.toFixed(1), 'alpha:', event.alpha.toFixed(1), 'beta:', beta.toFixed(1));
        setHeading(heading);
      }
      // When pointing at sky/ground, heading stays frozen at last good value
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
        // Prefer deviceorientationabsolute for true north on Android/Chrome
        if ('ondeviceorientationabsolute' in window) {
          console.log('✅ Using deviceorientationabsolute for true north!');
          window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
        } else {
          console.log('✅ Using standard deviceorientation (may not be absolute)');
          window.addEventListener('deviceorientation', handleOrientation);
        }
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
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
    };
  }, [handleOrientation]);

  return { heading, permissionState, requestPermission, error };
};
