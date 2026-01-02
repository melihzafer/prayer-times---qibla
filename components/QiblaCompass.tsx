import React, { useState, useEffect, useRef } from 'react';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { Translator } from '../types';
import { CameraIcon } from './Icons';

interface QiblaCompassProps {
  direction: number | null;
  t: Translator;
}

const QiblaCompass: React.FC<QiblaCompassProps> = ({ direction, t }) => {
  const [isLive, setIsLive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(() => {
    const saved = localStorage.getItem('compassCalibrationOffset');
    return saved ? parseFloat(saved) : 0;
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { heading, permissionState, requestPermission, error: compassError } = useDeviceOrientation();

  // Save calibration offset to localStorage
  useEffect(() => {
    localStorage.setItem('compassCalibrationOffset', calibrationOffset.toString());
  }, [calibrationOffset]);

  const adjustCalibration = (delta: number) => {
    setCalibrationOffset(prev => {
      const newOffset = (prev + delta + 360) % 360;
      return newOffset > 180 ? newOffset - 360 : newOffset;
    });
  };

  const resetCalibration = () => {
    setCalibrationOffset(0);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        } 
      });
      setStream(mediaStream);
      setCameraError(null);
    } catch (err) {
      console.error('Camera permission denied or error:', err);
      setCameraError('cameraPermissionDenied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleActivate = async () => {
    await requestPermission();
    await startCamera();
    setIsLive(true);
  };

  const handleDeactivate = () => {
    stopCamera();
    setIsLive(false);
  };

  // Set video source when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (direction === null) {
    return null;
  }

  // Calculate calibrated heading and deviation from Qibla
  // heading = (360 - alpha) % 360; // Already handled in hook
  const calibratedHeading = heading !== null ? (heading + calibrationOffset + 360) % 360 : null;
  
  // Calculate how far off we are from Qibla direction
  let qiblaDeviation = 180;
  if (calibratedHeading !== null) {
    const diff = Math.abs(calibratedHeading - direction);
    qiblaDeviation = diff > 180 ? 360 - diff : diff;
  }
  
  // Determine alignment state
  const isAligned = qiblaDeviation <= 10;
  const isClose = qiblaDeviation <= 30;
  
  // Calculate arrow rotation (where Qibla is relative to current heading)
  const arrowRotation = calibratedHeading !== null ? direction - calibratedHeading : 0;

  // Render static compass (when not live)
  const renderStaticCompass = () => (
    <div className="relative w-64 h-64 my-4">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-[6px] border-gray-200 dark:border-gray-700 shadow-inner"></div>
      
      {/* Compass Face */}
      <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 shadow-xl flex items-center justify-center">
        {/* NSEW Labels */}
        <span className="absolute top-4 text-sm font-bold text-red-500 tracking-widest">N</span>
        <span className="absolute bottom-4 text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest">S</span>
        <span className="absolute left-4 text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest">W</span>
        <span className="absolute right-4 text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest">E</span>

        {/* Ticks */}
        <div className="w-px h-full bg-gray-100 dark:bg-gray-700 absolute"></div>
        <div className="h-px w-full bg-gray-100 dark:bg-gray-700 absolute"></div>
        
        {/* Qibla Direction Indicator (Arrow) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${direction}deg)` }}
        >
          {/* Arrow Head */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0
            border-l-[10px] border-l-transparent
            border-r-[10px] border-r-transparent
            border-b-[24px] border-b-emerald-500 drop-shadow-md">
          </div>
          {/* Arrow Body/Line */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-[40%] bg-gradient-to-t from-transparent via-emerald-200 to-emerald-500 opacity-50 rounded-full origin-bottom -translate-y-full"></div>
        </div>
        
        {/* Center Pivot */}
        <div className="absolute w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full border-2 border-white dark:border-gray-700 z-10 shadow-sm"></div>
      </div>
    </div>
  );

  // AR View with Camera
  if (isLive) {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        {/* Camera Feed */}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover" 
          autoPlay 
          playsInline 
          muted
        />
        
        {/* GREEN SCREEN OVERLAY - Shows when aligned */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out ${
            isAligned 
              ? 'opacity-60 bg-emerald-500 mix-blend-overlay' 
              : isClose 
                ? 'opacity-30 bg-yellow-400 mix-blend-overlay' 
                : 'opacity-0'
          }`}
        />
        
        {/* Alignment Border (Pulse) */}
        <div 
          className={`absolute inset-4 rounded-[2rem] pointer-events-none transition-all duration-300 border-4 ${
            isAligned 
              ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.6)] animate-pulse' 
              : isClose 
                ? 'border-yellow-400/60 shadow-[0_0_30px_rgba(250,204,21,0.3)]' 
                : 'border-white/10'
          }`}
        />

        {/* Close Button */}
        <button 
          onClick={handleDeactivate}
          className="absolute top-4 right-4 z-50 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/60 transition-colors shadow-lg"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* HUD Compass (Top Left) */}
        <div className="absolute top-6 left-6 z-50 p-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 shadow-2xl">
          <div className="relative w-16 h-16 bg-black/60 rounded-full flex items-center justify-center overflow-hidden">
             {/* Rotating Dial */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{ transform: `rotate(${calibratedHeading !== null ? -calibratedHeading : 0}deg)` }}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-500">N</div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/50">S</div>
              <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/50">W</div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/50">E</div>
            </div>
            
            {/* Fixed Arrow (Pointing Up relative to screen, rotates with Qibla Math) */}
             <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${arrowRotation}deg)` }}
            >
              <div className={`w-0 h-0 -translate-y-5
                border-l-[6px] border-l-transparent
                border-r-[6px] border-r-transparent
                border-b-[14px] ${isAligned ? 'border-b-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'border-b-blue-400'}`}>
              </div>
            </div>
            
            {/* Center */}
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm z-10"></div>
            {/* Crosshair lines */}
            <div className="absolute w-full h-px bg-white/10"></div>
            <div className="absolute h-full w-px bg-white/10"></div>
          </div>
        </div>

        {/* Bottom Status & Controls Area */}
        <div className="absolute bottom-8 left-0 right-0 z-50 px-6 flex flex-col items-center gap-4">
          
          {/* Status Pill */}
          <div className={`
            flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md shadow-lg border transition-all duration-300
            ${isAligned 
              ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-100' 
              : isClose 
                ? 'bg-yellow-900/60 border-yellow-500/50 text-yellow-100' 
                : 'bg-gray-900/60 border-white/20 text-white'}
          `}>
             <span className={`text-2xl ${isAligned ? 'animate-bounce' : ''}`}>
               {isAligned ? '🙌' : isClose ? '👀' : '🧭'}
             </span>
             <div className="flex flex-col">
               <span className="text-sm font-bold uppercase tracking-wider">
                 {t(isAligned ? 'qiblaFound' : isClose ? 'almostThere' : 'keepSearching')}
               </span>
               <span className="text-xs opacity-70 font-mono">
                 {qiblaDeviation.toFixed(0)}° {t('away')}
               </span>
             </div>
          </div>

          {/* Calibration Bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
             <button 
               onClick={() => adjustCalibration(-5)} 
               className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
               aria-label="-5 degrees"
              >
               <span className="text-xs font-bold">−5</span>
             </button>
             <button 
               onClick={() => adjustCalibration(-1)} 
               className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/80 transition-colors"
               aria-label="-1 degree"
              >
               <span className="text-[10px]">−1</span>
             </button>
             
             <div className="mx-2 min-w-[50px] text-center flex flex-col items-center">
                <span className="text-[10px] uppercase text-white/40 tracking-widest">{t('calibrateCompass')}</span>
                <span className="text-sm font-mono font-bold text-white">
                  {calibrationOffset >= 0 ? '+' : ''}{calibrationOffset}°
                </span>
             </div>

             <button 
               onClick={() => adjustCalibration(1)} 
               className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/80 transition-colors"
               aria-label="+1 degree"
              >
               <span className="text-[10px]">+1</span>
             </button>
             <button 
               onClick={() => adjustCalibration(5)} 
               className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
               aria-label="+5 degrees"
              >
               <span className="text-xs font-bold">+5</span>
             </button>
          </div>
          
          {calibrationOffset !== 0 && (
             <button
               onClick={resetCalibration}
               className="text-xs text-white/50 hover:text-white transition-colors underline"
             >
               {t('resetCalibration')}
             </button>
           )}

        </div>
        
        {/* Errors */}
        {(compassError || cameraError) && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg shadow-lg max-w-[90%] text-center">
            {t(compassError || ((cameraError as any) ?? 'error'))}
          </div>
        )}
      </div>
    );
  }

  // Modern Card View (Not Live)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[4rem] -z-1"></div>
      
      <div className="flex flex-col items-center space-y-1 z-10">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{t('qiblaDirection')}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mecca Coordinate</span>
      </div>
      
      {renderStaticCompass()}
      
      <div className="text-center z-10">
        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
           {direction.toFixed(1)}°
        </div>
        <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Longitude</div>
      </div>

      {permissionState !== 'denied' && (
        <button 
          onClick={handleActivate}
          className="group relative w-full py-4 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <CameraIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>{t('activateLiveCompass')}</span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[25deg] group-hover:animate-shine"></div>
          </div>
        </button>
      )}

      {/* Google Qibla Finder Button */}
      <a 
        href="https://qiblafinder.withgoogle.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 px-6 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{t('googleQiblaFinder')}</span>
      </a>
    </div>
  );
};

export default QiblaCompass;

// Add this to your tailwind.config.js if you don't have a shine animation:
// keyframes: { shine: { '0%': { left: '-100%' }, '100%': { left: '200%' } } }, animation: { shine: 'shine 1.5s infinite' }