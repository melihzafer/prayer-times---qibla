import React from 'react';
import QiblaCompass from '../components/QiblaCompass';
import { Translator } from '../types';

interface QiblaProps {
  direction: number | null;
  t: Translator;
}

const Qibla: React.FC<QiblaProps> = ({ direction, t }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">{t('qibla')}</h1>
      <QiblaCompass direction={direction} t={t} />
    </div>
  );
};

export default Qibla;
