import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { Translator, Coordinates } from '../types';
import { CameraIcon } from './Icons';

interface QiblaCompassProps {
  direction: number | null;
  location: Coordinates | null;
  t: Translator;
}

const QiblaCompass: React.FC<QiblaCompassProps> = ({ direction, location, t }) => {
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCalibrationOverlay, setShowCalibrationOverlay] = useState(false);
  // We'll keep the tutorial logic but not show it automatically on every load unless it's the very first time and we want to be strict.
  // Given user request "active on load", we prioritize the compass.

  
  // Check for Secure Context (HTTPS or localhost)
  const [isSecure, setIsSecure] = useState(true);
  

  useEffect(() => {
    if (typeof window !== 'undefined' && window.isSecureContext !== undefined) {
      setIsSecure(window.isSecureContext);
    }
  }, []);

  // NOTE: Auto-start REMOVED. User wants to see static compass + buttons first.
  // The AR camera only opens when the user clicks "Activate Live Compass".


  const { heading, trueHeading, accuracy, permissionState, requestPermission, error: compassError } = useDeviceOrientation(location);

  const [calibrationOffset, setCalibrationOffset] = useState<number>(() => {
    const saved = localStorage.getItem('compassCalibrationOffset');
    return saved ? parseFloat(saved) : 0;
  });

  const dismissTutorial = (permanently: boolean = false) => {
    if (permanently) {
      localStorage.setItem('hideQiblaTutorial', 'true');
    }
    setShowCalibrationOverlay(false);
  };

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
    // Request Compass Permission (iOS)
    if (requestPermission) {
      try {
        await requestPermission();
      } catch (e) { 
        // Ignore iOS permission error on auto-start, wait for manual click
        console.log("Permission request failed during auto-start", e);
        return; 
      }
    }
    setCameraError(null);
    setIsLive(true);
    // Note: Camera starts via the <video> conditional rendering in JSX when isLive is true
    // But we need to actually call getUserMedia? 
    // Wait, the current implementation calls startCamera() inside a useEffect when isLive changes?
    // Let's check the useEffect that watches isLive...
    // Ah, it's lines 105+ which I cannot see fully but I assume exists.
    // If not, I need to add that logic or call startCamera directly.
    // Based on previous view, I didn't see a useEffect for isLive->startCamera unless I missed it.
    // Let's just call startCamera() here to be safe if not handled elsewhere.
    await startCamera();
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

  // Use True Heading if available (Logic: True Heading > Heading + Declination > Heading)
  // The hook already calculates trueHeading from heading + declination if needed.
  const effectiveHeading = trueHeading ?? heading;

  // Calculate calibrated heading and deviation from Qibla
  const calibratedHeading = effectiveHeading !== null ? (effectiveHeading + calibrationOffset + 360) % 360 : null;
  
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

  // Visual Helper for Accuracy
  const isAccurate = accuracy === 'high' || accuracy === 'unknown';

  // Render static compass (when not live)
  const renderStaticCompass = () => (
    <div className="relative w-64 h-64 my-4 group/compass">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-[6px] border-slate-100 dark:border-brand-dark/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"></div>
      
      {/* Compass Face Container - Rotates with Heading */}
      <div 
        className="absolute inset-2 rounded-full bg-white dark:bg-brand-dark border-2 border-white dark:border-white/5 shadow-2xl flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{ 
          transform: `rotate(${-((calibratedHeading ?? 0) % 360)}deg)` 
        }}
      >
        {/* NSEW Labels */}
        <span className="absolute top-4 text-xs font-black text-brand-primary tracking-widest font-outfit">N</span>
        <span className="absolute bottom-4 text-xs font-black text-slate-300 dark:text-white/30 tracking-widest font-outfit">S</span>
        <span className="absolute left-4 text-xs font-black text-slate-300 dark:text-white/30 tracking-widest font-outfit">W</span>
        <span className="absolute right-4 text-xs font-black text-slate-300 dark:text-white/30 tracking-widest font-outfit">E</span>

        {/* Ticks */}
        <div className="w-px h-full bg-slate-50 dark:bg-white/5 absolute"></div>
        <div className="h-px w-full bg-slate-50 dark:bg-white/5 absolute"></div>
        
        {/* Qibla Direction Indicator (Arrow) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${direction}deg)` }}
        >
          {/* Arrow Head */}
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0
            border-l-[12px] border-l-transparent
            border-r-[12px] border-r-transparent
            border-b-[28px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-colors duration-300
            ${isAligned ? 'border-b-brand-accent animate-pulse' : 'border-b-brand-primary'}`}>
          </div>
          {/* Arrow Body/Line */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-[42%] bg-gradient-to-t from-transparent rounded-full origin-bottom -translate-y-full
             ${isAligned ? 'via-brand-accent/30 to-brand-accent' : 'via-brand-primary/30 to-brand-primary'} opacity-50`}></div>
        </div>
        
        {/* Center Pivot */}
        <div className="absolute w-4 h-4 bg-brand-dark dark:bg-white rounded-full border-2 border-white dark:border-brand-dark z-10 shadow-lg"></div>
      </div>
      
      {/* Calibration Alert */}
       {!isAccurate && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-3/4 text-center bg-brand-primary/10 dark:bg-brand-primary/20 p-3 rounded-2xl border border-brand-primary/20 backdrop-blur-md animate-pulse">
            <span className="text-[10px] font-black text-brand-primary dark:text-brand-primary uppercase tracking-[0.2em] leading-tight block">
               ⚠️ {t('calibrateCompass') || "Figure-8 Motion Required"}
            </span>
          </div>
        )}
    </div>
  );

  // AR HUD UI - Simplified and Robust
  const renderARView = () => {
    const arrowRotation = direction - (calibratedHeading ?? 0);
    
    // Normalize deviation to -180 to 180 for "turn left/right" logic
    let relativeDeviation = (direction - (calibratedHeading ?? 0)) % 360;
    if (relativeDeviation > 180) relativeDeviation -= 360;
    if (relativeDeviation < -180) relativeDeviation += 360;

    const showLeftArrow = relativeDeviation < -15;
    const showRightArrow = relativeDeviation > 15;

    return (
      <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden font-sans">
        {/* Camera Feed */}
        {stream && (
           <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover z-0" 
            autoPlay 
            playsInline 
            muted
          />
        )}
        
        {/* Dark Scrim for HUD visibility */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

        {/* LOADING & ERROR STATES */}
        {!stream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 z-10 bg-brand-dark">
            {!cameraError ? (
              <>
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">📷</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-outfit">Initializing Camera</h3>
                  <p className="text-sm text-white/40 max-w-[200px]">Ensuring high-precision orientation for Qibla find...</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                  <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white font-outfit">{t('cameraError')}</h3>
                  <p className="text-sm text-slate-400 max-w-xs">{t('cameraPermissionDenied')}</p>
                </div>
                <button onClick={handleDeactivate} className="mt-8 px-8 py-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all font-bold">
                  Go Back
                </button>
              </>
            )}
          </div>
        )}

        {/* HUD ELEMENTS - Only show when stream is active */}
        {stream && (
          <>
            {/* Visual Alignment Glow */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isAligned ? 'opacity-40 bg-brand-accent shadow-[inset_0_0_100px_rgba(6,182,212,0.5)]' : 'opacity-0'}`} />

            {/* TOP HUD: Mini Compass */}
            <div className="absolute top-12 left-0 right-0 z-20 px-8 flex justify-between items-start pointer-events-none">
              <div className="glass bg-black/40 border-white/20 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4">
                <div className="relative w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
                  <div 
                    className="absolute inset-1 transition-transform duration-300"
                    style={{ transform: `rotate(${-((calibratedHeading ?? 0))}deg)` }}
                  >
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-black text-red-500">N</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40">S</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-brand-accent rounded-full shadow-lg z-10" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Heading</div>
                   <div className="text-xl font-black text-white font-mono leading-none">{Math.round(calibratedHeading ?? 0)}°</div>
                </div>
              </div>

              <button 
                onClick={handleDeactivate}
                className="p-4 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-black/60 active:scale-95 transition-all pointer-events-auto"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* CENTER HUD: The Target & Guidance */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              
              {/* Turn Left Guidance */}
              <div className={`absolute left-8 transition-all duration-500 ${showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse opacity-20" />
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse opacity-60" />
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Turn Left</span>
                </div>
              </div>

              {/* Turn Right Guidance */}
              <div className={`absolute right-8 transition-all duration-500 ${showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse" />
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse opacity-60" />
                    <span className="w-2 h-8 bg-brand-accent rounded-full animate-pulse opacity-20" />
                  </div>
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Turn Right</span>
                </div>
              </div>

              {/* The Qibla Pointer Wrapper */}
              <div 
                className="relative flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                {/* Visual Ring */}
                <div className={`w-64 h-64 border-[1.5px] rounded-full transition-all duration-500 flex items-center justify-center ${isAligned ? 'border-brand-accent scale-110 shadow-[0_0_60px_rgba(6,182,212,0.4)]' : 'border-white/20'}`}>
                   {/* Inner Target Center */}
                   <div className={`w-4 h-4 rounded-full transition-all duration-300 ${isAligned ? 'bg-brand-accent scale-150' : 'bg-white/40'}`} />
                </div>

                {/* The Arrow (Points to Kaaba) */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className={`w-0.5 h-32 bg-gradient-to-t from-transparent transition-all duration-500 ${isAligned ? 'to-brand-accent w-1' : 'to-white/40'}`} />
                  <div className="relative -mt-1">
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center rotate-45 transition-all duration-500 border ${isAligned ? 'bg-brand-accent border-white text-brand-dark shadow-[0_0_30px_rgba(6,182,212,0.8)] -rotate-0' : 'bg-black/40 border-white/20 text-white'}`}>
                       <span className={`text-2xl transition-transform duration-500 ${isAligned ? 'scale-125' : 'scale-100'}`}>🕋</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM HUD: Alignment Status */}
            <div className="absolute bottom-16 left-0 right-0 z-20 px-10 flex flex-col items-center gap-8 pointer-events-none">
              
              {/* Calibration Warning */}
              {!isAccurate && (
                <div className="glass bg-yellow-500/10 border-yellow-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 animate-pulse">
                  <span className="text-lg">⚠️</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Calibration Low</span>
                    <span className="text-xs text-white/60 font-medium">Wave phone in infinity motion</span>
                  </div>
                </div>
              )}

              {/* Status Pill */}
              <div className={`
                w-full max-w-sm glass rounded-[2.5rem] p-6 flex items-center justify-between transition-all duration-700
                ${isAligned ? 'bg-brand-accent/20 border-brand-accent/40 shadow-[0_0_50px_rgba(0,0,0,0.4)]' : 'bg-black/40 border-white/10 shadow-2xl'}
              `}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${isAligned ? 'bg-brand-accent text-white animate-bounce' : 'bg-white/10 text-white/40'}`}>
                    {isAligned ? '✨' : isClose ? '👌' : '🔭'}
                  </div>
                  <div className="space-y-0.5">
                    <div className={`text-sm font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isAligned ? 'text-brand-accent' : 'text-white'}`}>
                      {t(isAligned ? 'qiblaFound' : isClose ? 'almostThere' : 'keepSearching')}
                    </div>
                    <div className="text-xs text-white/40 font-medium lowercase tracking-wide">
                      {qiblaDeviation.toFixed(0)}° {t('away')}
                    </div>
                  </div>
                </div>
                
                {isAligned && (
                   <div className="flex h-12 items-center gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-1 bg-brand-accent rounded-full animate-bounce" style={{ height: `${i*30}%`, animationDelay: `${i*0.1}s` }} />
                      ))}
                   </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const arOverlay = isLive && typeof document !== 'undefined' 
    ? createPortal(renderARView(), document.getElementById('ar-portal') || document.body)
    : null;

  // Modern Card View (Not Live)
  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group">
      {arOverlay}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      
      <div className="flex flex-col items-center space-y-2 z-10 text-center">
        <h2 className="text-3xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter">{t('qiblaDirection')}</h2>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{t('meccaCoordinate') || "Holy Kaaba Center"}</p>
      </div>
      
      {renderStaticCompass()}
      
      <div className="text-center z-10 space-y-1">
        <div className="text-5xl font-black font-outfit text-brand-primary dark:text-brand-primary tracking-tighter">
           {direction.toFixed(1)}°
        </div>
        {accuracy === 'low' && (
           <div className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] animate-pulse">Low Accuracy</div>
        )}
      </div>

      {permissionState !== 'denied' && (
        <button 
          onClick={handleActivate}
          className="group relative w-full py-5 px-8 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-[1.5rem] flex items-center justify-center gap-4 font-bold font-outfit text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_15px_35px_rgba(79,70,229,0.3)]"
        >
          <CameraIcon className="w-6 h-6 transition-all group-hover:rotate-12 group-hover:scale-110" />
          <span>{t('activateLiveCompass')}</span>
          
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[25deg] group-hover:animate-shine"></div>
          </div>
        </button>
      )}

      {/* Google Qibla Finder Button */}
      <a 
        href="https://qiblafinder.withgoogle.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 px-8 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] flex items-center justify-center gap-3 font-bold font-outfit text-slate-600 dark:text-slate-300 transition-all hover:bg-white hover:shadow-lg active:scale-[0.98]"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{t('googleQiblaFinder')}</span>
      </a>

      {/* Initial Calibration Overlay */}
      {showCalibrationOverlay && (
        <div className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-y-auto">
          
          <div className="max-w-md w-full flex flex-col items-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-4xl font-black font-outfit text-white tracking-tighter">
                {t('howToCalibrate')}
              </h3>
              <p className="text-brand-accent font-black uppercase tracking-[0.2em] text-[10px]">{t('calibrationRequired') || "Precision Alignment Setup"}</p>
            </div>

            {/* Animation Container */}
            <div className="relative w-56 h-56 flex items-center justify-center bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl">
              {/* Figure 8 Path Visualization */}
              <svg className="absolute w-40 h-20 text-brand-accent/20 overflow-visible" viewBox="0 0 100 50">
                <path 
                  d="M50,25 C70,25 70,5 90,5 C105,5 105,45 90,45 C70,45 70,25 50,25 C30,25 30,5 10,5 C-5,5 -5,45 10,45 C30,45 30,25 50,25 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  className="blur-[1px]"
                />
              </svg>

              {/* Animated Phone Icon */}
              <div className="calibration-animation transform z-10">
                <div className="w-12 h-20 bg-gradient-to-br from-slate-800 to-black rounded-2xl border-2 border-brand-accent shadow-[0_0_30px_rgba(6,182,212,0.5)] flex flex-col items-center justify-center relative">
                  <div className="w-8 h-10 bg-slate-900 rounded mb-1 border border-white/5"></div>
                  <div className="w-2 h-2 bg-brand-accent rounded-full mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="text-left space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 w-full">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black font-outfit text-lg shadow-lg">
                    {step}
                  </span>
                  <p className="text-slate-300 font-medium leading-relaxed font-inter">
                    {t(`calibrationGuideStep${step}`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => dismissTutorial(false)}
                className="w-full py-5 bg-gradient-to-r from-brand-accent to-brand-primary text-white font-black font-outfit text-xl rounded-2xl transition-all shadow-[0_15px_30px_rgba(6,182,212,0.3)] active:scale-[0.95]"
              >
                {t('imReady')}
              </button>
              
              <button
                onClick={() => dismissTutorial(true)}
                className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all"
              >
                {t('dontShowAgain') || "Don't Show Again"}
              </button>
            </div>

            {/* Google Qibla Finder Help */}
            <div className="pt-6 border-t border-white/5 w-full space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black font-outfit text-slate-400 uppercase tracking-widest">{t('usingGoogleQibla')}</h4>
                <p className="text-xs text-slate-500 font-medium">{t('googleQiblaDesc')}</p>
              </div>
               <a 
                 href="https://qiblafinder.withgoogle.com/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-brand-accent text-sm font-black font-outfit hover:text-white transition-all group"
               >
                 <span>{t('googleQiblaFinder')}</span>
                 <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
               </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default QiblaCompass;

// Add this to your tailwind.config.js if you don't have a shine animation:
// keyframes: { shine: { '0%': { left: '-100%' }, '100%': { left: '200%' } } }, animation: { shine: 'shine 1.5s infinite' }