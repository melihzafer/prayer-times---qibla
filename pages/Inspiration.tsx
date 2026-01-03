import React from 'react';
import HadithOfTheDay from '../components/HadithOfTheDay';
import AsmaUlHusna from '../components/AsmaUlHusna';
import { Translator } from '../types';

interface InspirationProps {
  t: Translator;
}

const Inspiration: React.FC<InspirationProps> = ({ t }) => {
  return (
    <div className="space-y-12 animate-fadeIn pb-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter">
          {t('inspiration')}
        </h1>
        <div className="w-12 h-1 bg-brand-primary mx-auto rounded-full"></div>
      </div>

      <div className="space-y-10">
        <HadithOfTheDay t={t} />
        <AsmaUlHusna t={t} />
      </div>
    </div>
  );
};

export default Inspiration;
