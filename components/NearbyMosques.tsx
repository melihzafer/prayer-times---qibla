import React from 'react';
import { Translator } from '../types';
import { isGeminiAvailable } from '../services/api';
import { MosqueIcon, SparklesIcon } from './Icons';

interface NearbyMosquesProps {
  onOpenModal: () => void;
  t: Translator;
}

const NearbyMosques: React.FC<NearbyMosquesProps> = ({ onOpenModal, t }) => {

  if (!isGeminiAvailable()) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('noApiKey')}</p>
      </div>
    );
  }

  return (
    <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 border border-white/40 dark:border-white/10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      
      <div className="flex items-center space-x-3 transition-transform duration-300 group-hover:scale-105 relative z-10">
        <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent">
          <MosqueIcon />
        </div>
        <h2 className="text-2xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight leading-none">{t('nearbyMosques')}</h2>
      </div>

      <button
        onClick={onOpenModal}
        className="w-full relative flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-accent to-brand-primary text-white rounded-2xl hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all duration-300 font-bold font-outfit text-lg tracking-tight z-10"
      >
        <SparklesIcon className="w-6 h-6 mr-3 animate-pulse" />
        {t('findNearbyMosques')}
      </button>

      <p className="text-[10px] text-center font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 leading-relaxed relative z-10 opacity-70">
        {t('geminiInfo')}
      </p>
    </div>
  );
};

export default NearbyMosques;