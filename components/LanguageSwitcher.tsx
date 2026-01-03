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
    <div className="relative group/lang">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-brand-dark/80 transition-all duration-300 shadow-sm group-hover/lang:shadow-md group-hover/lang:border-brand-primary/30">
        <div className="text-brand-primary group-hover/lang:scale-110 transition-transform duration-300">
          <GlobeIcon />
        </div>
        <span className="font-outfit font-bold text-brand-dark dark:text-white text-sm tracking-tight capitalize">
          {LANGUAGES.find(l => l.code === language)?.name || language}
        </span>
        <div className="ml-1 text-slate-400 dark:text-slate-500 group-hover/lang:text-brand-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        aria-label={t('language')}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-brand-dark text-brand-dark dark:text-white">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
