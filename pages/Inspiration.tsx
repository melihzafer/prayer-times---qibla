import React from 'react';
import HadithOfTheDay from '../components/HadithOfTheDay';
import AsmaUlHusna from '../components/AsmaUlHusna';
import { Translator } from '../types';

interface InspirationProps {
  t: Translator;
}

const Inspiration: React.FC<InspirationProps> = ({ t }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">{t('inspiration')}</h1>
      <HadithOfTheDay t={t} />
      <AsmaUlHusna t={t} />
    </div>
  );
};

export default Inspiration;
