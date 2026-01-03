import React from 'react';
import QiblaCompass from '../components/QiblaCompass';
import { Translator, Coordinates } from '../types';

interface QiblaProps {
  direction: number | null;
  location: Coordinates | null;
  t: Translator;
}

const Qibla: React.FC<QiblaProps> = ({ direction, location, t }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter">{t('qibla')}</h1>
        <div className="w-12 h-1 bg-brand-primary mx-auto rounded-full"></div>
      </div>
      
      <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 overflow-hidden">
        <QiblaCompass direction={direction} location={location} t={t} />
      </div>
    </div>
  );
};

export default Qibla;
