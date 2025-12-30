import React, { useState } from 'react';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { Translator } from '../types';

interface QiblaCompassProps {
  direction: number | null;
  t: Translator;
}

const QiblaCompass: React.FC<QiblaCompassProps> = ({ direction, t }) => {
  const [isLive, setIsLive] = useState(false);
  const { heading, permissionState, requestPermission, error } = useDeviceOrientation();

  const handleActivate = async () => {
    await requestPermission();
    setIsLive(true);
  };

  if (direction === null) {
    return null;
  }

  const compassRotation = isLive && heading !== null ? -heading : 0;
  
  const renderCompassContent = () => {
    if (isLive && error) {
      return <p className="text-red-500">{t(error)}</p>;
    }
    
    return (
       <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        {/* Compass background - rotates with device orientation */}
        <div 
          className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-transform duration-100"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          <span className="absolute top-2 text-sm font-bold text-red-500 dark:text-red-400">N</span>
          <span className="absolute bottom-2 text-sm font-bold text-gray-700 dark:text-gray-200">S</span>
          <span className="absolute left-2 text-sm font-bold text-gray-700 dark:text-gray-200">W</span>
          <span className="absolute right-2 text-sm font-bold text-gray-700 dark:text-gray-200">E</span>
          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 absolute"></div>
          <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-600 absolute"></div>
        
          {/* Qibla Arrow - Points in absolute direction, independent of device rotation */}
          <div 
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            style={{ transform: `rotate(${direction - (isLive && heading !== null ? heading : 0)}deg)` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0
              border-l-[12px] border-l-transparent
              border-r-[12px] border-r-transparent
              border-b-[24px] border-b-blue-500">
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-1/2 bg-blue-500 rounded-b-full"></div>
          </div>
        </div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 dark:bg-white rounded-full border-2 border-white dark:border-gray-800"></div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-bold">{t('qiblaDirection')}</h2>
      
      {renderCompassContent()}
      
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{direction.toFixed(1)}°</p>

      {!isLive && permissionState !== 'denied' && (
        <button 
          onClick={handleActivate}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('activateLiveCompass')}
        </button>
      )}

      {isLive && !error && (
         <p className="text-sm text-green-600 dark:text-green-400">{t('liveCompassActive')}</p>
      )}
    </div>
  );
};

export default QiblaCompass;