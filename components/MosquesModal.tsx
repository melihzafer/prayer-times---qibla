import React, { useEffect, useState } from 'react';
import { Coordinates, Translator, Mosque } from '../types';
import { useMosqueFinder, openDirectionsInMaps, openLocationInMaps, openMosquesNearMe } from '../hooks/useMosqueFinder';
import Loader from './Loader';

interface MosquesModalProps {
  isOpen: boolean;
  coordinates: Coordinates;
  t: Translator;
  onClose: () => void;
}

const MosquesModal: React.FC<MosquesModalProps> = ({ isOpen, coordinates, t, onClose }) => {
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  // Only pass coordinates when modal is open and search has been triggered
  const { mosques, loading, error, refetch } = useMosqueFinder(
    isOpen && searchTriggered ? coordinates : null
  );

  // Trigger search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTriggered(true);
    } else {
      setSearchTriggered(false);
    }
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
          <div className="sticky top-0 z-10 bg-white/40 dark:bg-brand-dark/40 backdrop-blur-xl border-b border-white/40 dark:border-white/10 p-6 sm:p-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight flex items-center gap-3">
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
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
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

            {/* Error State */}
            {!loading && error && mosques.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center text-4xl">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-outfit text-brand-dark dark:text-white">
                    {error}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-inter max-w-sm">
                    Try using Google Maps instead
                  </p>
                </div>
                <button
                  onClick={openMosquesNearMe}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-2xl font-bold font-outfit shadow-lg shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open Google Maps ➔
                </button>
              </div>
            )}

            {/* Mosques List */}
            {!loading && mosques.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/40 dark:border-white/10">
                  <p className="text-brand-accent font-black font-outfit text-sm tracking-widest uppercase">
                    ✨ Found {mosques.length} mosque{mosques.length !== 1 ? 's' : ''}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-tighter">
                    OpenStreetMap
                  </span>
                </div>

                <div className="grid gap-4">
                  {mosques.map((mosque: Mosque) => (
                    <div
                      key={mosque.id}
                      className="group relative p-5 rounded-2xl bg-white/40 dark:bg-brand-dark/40 border border-white/40 dark:border-white/10 hover:border-brand-primary/40 hover:bg-white/60 dark:hover:bg-brand-dark/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
                    >
                      <div className="space-y-3">
                        {/* Header: Name + Distance */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-lg font-extrabold font-outfit text-brand-dark dark:text-white leading-tight flex-1">
                            {mosque.name}
                          </h4>
                          {mosque.distance && (
                            <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                              📍 {mosque.distance}
                            </span>
                          )}
                        </div>
                        
                        {/* Address */}
                        {mosque.address && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-inter leading-snug">
                            {mosque.address}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {/* View on Map Button */}
                          <button
                            onClick={() => openLocationInMaps(mosque.location.lat, mosque.location.lng, mosque.name)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-brand-dark dark:text-white hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            View on Map
                          </button>
                          
                          {/* Get Directions Button */}
                          <button
                            onClick={() => openDirectionsInMaps(mosque.location.lat, mosque.location.lng, mosque.name)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Get Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Maps Fallback Button */}
                <div className="pt-4 text-center border-t border-white/20 dark:border-white/5">
                  <button
                    onClick={openMosquesNearMe}
                    className="inline-flex items-center gap-2 text-sm text-brand-primary hover:text-brand-accent font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Open in Google Maps App
                  </button>
                </div>
              </div>
            )}

            {/* No results */}
            {!loading && mosques.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-brand-dark/50 rounded-[2rem] flex items-center justify-center text-4xl">
                  🏘️
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-outfit text-brand-dark dark:text-white">No mosques found nearby</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-inter">Try using Google Maps for more results</p>
                </div>
                <button
                  onClick={openMosquesNearMe}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Search in Google Maps
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 bg-white/40 dark:bg-brand-dark/40 backdrop-blur-xl border-t border-white/40 dark:border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-xl font-extrabold font-outfit text-sm tracking-wide uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg"
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
