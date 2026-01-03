import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, SunIcon, MoonIcon, UserIcon } from './Icons';
import LanguageSwitcher from './LanguageSwitcher';
import { Translator, UserProfile } from '../types';

interface HeaderProps {
  city: string;
  onSearch: (city: string) => void;
  onRequestLocation: () => void;
  method: number;
  setMethod: (method: number) => void;
  availableMethods: { id: number; name: string }[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  t: Translator;
  user: UserProfile;
  login: () => void;
  logout: () => void;
}

const SearchBar: React.FC<{ onSearch: (query: string) => void; t: Translator }> = ({ onSearch, t }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full group">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all duration-300 font-inter text-brand-dark dark:text-white placeholder:text-slate-400 group-hover:bg-white/80 dark:group-hover:bg-brand-dark/80"
                aria-label={t('searchPlaceholder')}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary transition-transform duration-300 group-focus-within:scale-110">
                <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
        </form>
    );
};


const Header: React.FC<HeaderProps> = ({
  city,
  onSearch,
  onRequestLocation,
  method,
  setMethod,
  availableMethods,
  theme,
  toggleTheme,
  language,
  setLanguage,
  t,
  user,
  login,
  logout
}) => {
  return (
    <header className="p-6 space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/20 dark:bg-black/10 p-4 rounded-2xl border border-white/20 dark:border-white/5 gap-4">
        <div className="flex-1 min-w-0 w-full sm:w-auto">
            <h1 className="text-2xl font-extrabold font-outfit text-brand-primary dark:text-brand-primary truncate tracking-tight">{t('prayerTimes')}</h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-widest mt-1 flex items-center">
              <span className="inline-block w-2 h-2 bg-brand-accent rounded-full mr-2 animate-pulse flex-shrink-0"></span>
              <span className="truncate">{city || t('noLocationSelected')}</span>
            </p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0 w-full sm:w-auto justify-end">
           <LanguageSwitcher language={language} setLanguage={setLanguage} t={t} />
           
           <div className="flex bg-slate-100 dark:bg-brand-dark/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              onClick={onRequestLocation}
              className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-brand-dark hover:shadow-sm text-brand-primary transition-all duration-300 active:scale-90"
              aria-label={t('useMyLocation')}
              >
              <MapPinIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg hover:bg-white dark:hover:bg-brand-dark hover:shadow-sm text-brand-primary transition-all duration-300 active:scale-90"
              aria-label={t('toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={user.isLoggedIn ? logout : login}
              className={`p-2.5 rounded-lg hover:bg-white dark:hover:bg-brand-dark hover:shadow-sm transition-all duration-300 active:scale-90 ${user.isLoggedIn ? 'text-brand-primary' : 'text-slate-400'}`}
              aria-label={user.isLoggedIn ? t('logout') : t('login')}
            >
              <UserIcon className="w-5 h-5" />
            </button>
           </div>
        </div>
      </div>

       {user.isLoggedIn && (
        <div className="p-3 px-6 text-center text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 uppercase tracking-[0.2em] shadow-sm animate-fadeIn">
          {t('welcomeUser', user.name)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 items-stretch">
        <div className="flex-grow">
          <SearchBar onSearch={onSearch} t={t} />
        </div>
        <div className="relative group flex items-stretch">
          <select
            value={method}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="w-full appearance-none pl-4 pr-10 py-4 bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all duration-300 font-outfit font-bold text-brand-dark dark:text-white cursor-pointer group-hover:bg-white/80 dark:group-hover:bg-brand-dark/80 h-full"
            aria-label="Select calculation method"
          >
            {availableMethods.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-brand-dark">
                {m.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none transition-transform group-hover:translate-y-[-40%]">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
             </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;