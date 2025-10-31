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
        <form onSubmit={handleSubmit} className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                aria-label={t('searchPlaceholder')}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MagnifyingGlassIcon />
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
    <header className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 truncate">{t('prayerTimes')}</h1>
            <p className="text-gray-600 dark:text-gray-300 truncate">{city || t('noLocationSelected')}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
           <LanguageSwitcher language={language} setLanguage={setLanguage} t={t} />
           <button
            onClick={onRequestLocation}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={t('useMyLocation')}
            >
             <MapPinIcon />
           </button>
           <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={t('toggleTheme')}
           >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
           </button>
           <button
            onClick={user.isLoggedIn ? logout : login}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={user.isLoggedIn ? t('logout') : t('login')}
           >
            <UserIcon />
           </button>
        </div>
      </div>
       {user.isLoggedIn && (
        <div className="p-2 text-center text-sm bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg">
          {t('welcomeUser', user.name)}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <SearchBar onSearch={onSearch} t={t} />
        </div>
        <div>
          <select
            value={method}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="w-full h-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            aria-label="Select calculation method"
          >
            {availableMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;