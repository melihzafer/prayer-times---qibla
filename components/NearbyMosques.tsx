import React, { useState } from 'react';
import { Coordinates, Translator } from '../types';
import { findNearbyMosques, isGeminiAvailable } from '../services/api';
import Loader from './Loader';
import { MosqueIcon, SparklesIcon } from './Icons';

interface NearbyMosquesProps {
  coordinates: Coordinates;
  t: Translator;
}

const NearbyMosques: React.FC<NearbyMosquesProps> = ({ coordinates, t }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mosques, setMosques] = useState<any | null>(null);

  const handleFindMosques = async () => {
    setLoading(true);
    setError(null);
    setMosques(null);
    try {
      const response = await findNearbyMosques(coordinates);
      console.log('🕌 Mosques API response:', response);
      
      // Response contains { mosques: [...] } from backend
      if (response?.mosques) {
        console.log('📍 Found mosques:', response.mosques);
        setMosques(response.mosques);
      } else {
        console.warn('No mosques in response');
        setMosques(null);
      }
    } catch (err) {
      console.error('❌ Mosques error:', err);
      setError('Failed to find nearby mosques. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isGeminiAvailable()) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('noApiKey')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center space-y-4">
      <div className='flex items-center space-x-2'>
        <MosqueIcon />
        <h2 className="text-xl font-bold">{t('nearbyMosques')}</h2>
      </div>

      {!mosques && !loading && (
        <button
          onClick={handleFindMosques}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <SparklesIcon className="w-5 h-5 mr-2"/>
          {t('findNearbyMosques')}
        </button>
      )}

      {loading && <Loader />}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {mosques && (
        <div className="w-full text-left space-y-2">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">{t('geminiInfo')}</p>
          {Array.isArray(mosques) && mosques.length > 0 ? (
            mosques.map((mosque: any, index: number) => {
              // Handle both direct mosque objects and nested structures
              const title = mosque.name || mosque.maps?.title || mosque.title || 'Unknown Mosque';
              const uri = mosque.uri || mosque.maps?.uri || '#';
              return (
                <a 
                  key={index}
                  href={uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="font-semibold">{title}</p>
                  {mosque.address && <p className="text-xs text-gray-600 dark:text-gray-400">{mosque.address}</p>}
                  {mosque.distance && <p className="text-xs text-gray-500 dark:text-gray-500">{mosque.distance}</p>}
                  <span className="text-xs text-blue-500 hover:underline">{t('viewOnMap')}</span>
                </a>
              );
            })
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">
              {typeof mosques === 'string' ? mosques : t('noMosquesFound')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyMosques;