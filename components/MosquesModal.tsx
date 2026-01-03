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
        className={`fixed inset-0 z-40 transition-all duration-500 backdrop-blur-md ${
          isOpen ? 'bg-brand-dark/40 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'
        }`}
        onClick={() => !loading && onClose()}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`glass bg-white/90 dark:bg-brand-dark/90 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.25)] max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/40 dark:border-white/10 pointer-events-auto transition-all duration-500 transform ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/40 dark:bg-brand-dark/40 backdrop-blur-xl border-b border-white/40 dark:border-white/10 p-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight flex items-center gap-3">
                <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">🕌</span>
                {t('nearbyMosques')}
              </h2>
              <div className="w-12 h-1 bg-brand-primary rounded-full"></div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 text-slate-400 hover:text-brand-dark dark:hover:text-white hover:border-brand-primary/30 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  <Loader />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold font-outfit text-brand-dark dark:text-white tracking-tight">
                    🌍 Exploring your surroundings...
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-inter">
                    Finding the nearest places for prayer
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="glass bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-outfit text-brand-dark dark:text-white">Something went wrong</h3>
                <p className="text-slate-600 dark:text-slate-400 font-inter max-w-xs mx-auto">{error}</p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-bold font-outfit shadow-lg shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                  Go Back
                </button>
              </div>
            )}

            {!loading && mosques && mosques.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/40 dark:border-white/10">
                  <p className="text-brand-accent font-black font-outfit text-sm tracking-widest uppercase mb-1">
                    ✨ Found {mosques.length} mosque{mosques.length !== 1 ? 's' : ''}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold uppercase tracking-tighter">
                    Real-time Data
                  </span>
                </div>

                <div className="grid gap-4">
                  {mosques.map((mosque: any, index: number) => {
                    const title = mosque.name || mosque.maps?.title || mosque.title || 'Unknown Mosque';
                    const uri = mosque.uri || mosque.maps?.uri || '#';

                    return (
                      <a
                        key={index}
                        href={uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block p-6 rounded-3xl bg-white/40 dark:bg-brand-dark/40 border border-white/40 dark:border-white/10 hover:border-brand-primary/40 hover:bg-white/60 dark:hover:bg-brand-dark/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        </div>

                        <div className="relative space-y-3">
                          <h4 className="text-xl font-extrabold font-outfit text-brand-dark dark:text-white pr-12 leading-tight">
                            {title}
                          </h4>
                          
                          <div className="flex flex-col gap-2">
                            {mosque.address && (
                              <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                                <span className="mt-1 text-brand-primary">📍</span>
                                <p className="text-sm font-inter leading-snug">{mosque.address}</p>
                              </div>
                            )}
                            {mosque.distance && (
                              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <span className="text-brand-accent">📏</span>
                                <p className="text-sm font-bold font-outfit">{mosque.distance}</p>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary tracking-tight font-outfit group-hover:gap-2 transition-all">
                              {t('viewOnMap')} <span>→</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="pt-6 px-4 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
                  <p className="text-[10px] text-brand-primary/60 font-medium font-inter uppercase tracking-widest text-center pb-4 leading-relaxed">
                    {t('geminiInfo')}
                  </p>
                </div>
              </div>
            )}

            {!loading && mosques && mosques.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark/50 rounded-[2rem] flex items-center justify-center text-4xl">
                  🏘️
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-outfit text-brand-dark dark:text-white">No mosques found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-inter">Try expanding your search area</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 bg-white/40 dark:bg-brand-dark/40 backdrop-blur-xl border-t border-white/40 dark:border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-[1.25rem] font-extrabold font-outfit text-sm tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MosquesModal;
