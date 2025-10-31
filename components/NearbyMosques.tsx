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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-2">
        <MosqueIcon />
        <h2 className="text-xl font-bold">{t('nearbyMosques')}</h2>
      </div>

      <button
        onClick={onOpenModal}
        className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-semibold"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        {t('findNearbyMosques')}
      </button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        {t('geminiInfo')}
      </p>
    </div>
  );
};

export default NearbyMosques;