import React from 'react';
import { GlobeIcon } from './Icons';
import { LANGUAGES } from '../constants';
import { Translator } from '../types';

interface LanguageSwitcherProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translator;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage, t }) => {
  return (
    <div className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
      <GlobeIcon />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={t('language')}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
