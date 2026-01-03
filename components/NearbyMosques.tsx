import React from 'react';
import { Translator } from '../types';
import { openMosquesNearMe } from '../hooks/useMosqueFinder';
import { MosqueIcon, SparklesIcon } from './Icons';

interface NearbyMosquesProps {
  onOpenModal: () => void;
  t: Translator;
}

const NearbyMosques: React.FC<NearbyMosquesProps> = ({ onOpenModal, t }) => {
  return (
    <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 border border-white/40 dark:border-white/10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      
      <div className="flex items-center space-x-3 transition-transform duration-300 group-hover:scale-105 relative z-10">
        <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent">
          <MosqueIcon />
        </div>
        <h2 className="text-2xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight leading-none">{t('nearbyMosques')}</h2>
      </div>

      {/* Two Button Options */}
      <div className="w-full space-y-3 relative z-10">
        {/* Button 1: See in App (OpenStreetMap data) */}
        <button
          onClick={onOpenModal}
          className="w-full relative flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-accent to-brand-primary text-white rounded-2xl hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all duration-300 font-bold font-outfit text-lg tracking-tight"
        >
          <SparklesIcon className="w-6 h-6 mr-3 animate-pulse" />
          {t('findNearbyMosques')}
        </button>
        
        {/* Button 2: Open in Google Maps (external) */}
        <button
          onClick={openMosquesNearMe}
          className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-white dark:bg-brand-dark border-2 border-slate-200 dark:border-white/10 text-brand-dark dark:text-white rounded-2xl hover:border-brand-primary/50 hover:bg-brand-primary/5 active:scale-[0.98] transition-all duration-300 font-bold font-outfit text-base"
        >
          <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Open in Google Maps
        </button>
      </div>

      <p className="text-[10px] text-center font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 leading-relaxed relative z-10 opacity-70">
        Free data from OpenStreetMap • Navigation via Google Maps
      </p>
    </div>
  );
};

export default NearbyMosques;