import React, { useEffect } from 'react';
import { Coordinates, Translator } from '../types';
import { findNearbyMosques } from '../services/api';
import Loader from './Loader';

interface MosquesModalProps {
  isOpen: boolean;
  coordinates: Coordinates;
  t: Translator;
  onClose: () => void;
}

const MosquesModal: React.FC<MosquesModalProps> = ({ isOpen, coordinates, t, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mosques, setMosques] = React.useState<any[] | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
      setMosques(null);
      return;
    }

    const fetchMosques = async () => {
      setLoading(true);
      setError(null);
      setMosques(null);

      const startTime = Date.now();

      try {
        console.log('🕌 [Modal] Fetching mosques for:', coordinates);
        const response = await findNearbyMosques(coordinates);

        console.log(`🕌 [Modal] Response received in ${Date.now() - startTime}ms:`, response);

        let mosquesData = response?.mosques;

        if (Array.isArray(response)) {
          mosquesData = response;
        }

        console.log(`🕌 [Modal] Mosques data:`, mosquesData);

        if (mosquesData && Array.isArray(mosquesData) && mosquesData.length > 0) {
          console.log(`✅ [Modal] Found ${mosquesData.length} mosques`);
          setMosques(mosquesData);
          setError(null);
        } else {
          console.warn('⚠️ [Modal] No mosques found');
          setError('No mosques found in your area. Try a different location.');
          setMosques([]);
        }
      } catch (err) {
        console.error('❌ [Modal] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to find nearby mosques. Please try again.');
        setMosques([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!loading) {
            onClose();
          }
        }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">🕌 {t('nearbyMosques')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  🌍 Searching for mosques near you...
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-4">
                  ⏳ Please wait, this may take a moment...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            )}

            {!loading && mosques && mosques.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  ✅ Found {mosques.length} mosque{mosques.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4">
                  {t('geminiInfo')}
                </p>

                {mosques.map((mosque: any, index: number) => {
                  const title = mosque.name || mosque.maps?.title || mosque.title || 'Unknown Mosque';
                  const uri = mosque.uri || mosque.maps?.uri || '#';

                  return (
                    <a
                      key={index}
                      href={uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <p className="font-bold text-lg text-blue-900 dark:text-blue-300">{title}</p>
                      {mosque.address && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          📍 {mosque.address}
                        </p>
                      )}
                      {mosque.distance && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📏 {mosque.distance}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 font-semibold">
                        🗺️ {t('viewOnMap')} →
                      </p>
                    </a>
                  );
                })}
              </div>
            )}

            {!loading && mosques && mosques.length === 0 && !error && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No mosques data available
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MosquesModal;
