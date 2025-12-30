import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CompassIcon, BookOpenIcon, CalendarIcon, CogIcon } from './Icons';
import { Translator } from '../types';

interface BottomNavProps {
  t: Translator;
}

const BottomNav: React.FC<BottomNavProps> = ({ t }) => {
  const commonClasses = "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors";
  const activeClasses = "text-blue-600 dark:text-blue-400";
  const inactiveClasses = "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100";

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <HomeIcon className="w-6 h-6 mb-1" />
          <span>{t('home') || 'Home'}</span>
        </NavLink>
        
        <NavLink to="/qibla" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <CompassIcon className="w-6 h-6 mb-1" />
          <span>{t('qibla') || 'Qibla'}</span>
        </NavLink>
        
        <NavLink to="/inspiration" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <BookOpenIcon className="w-6 h-6 mb-1" />
          <span>{t('inspiration') || 'Inspire'}</span>
        </NavLink>
        
        <NavLink to="/calendar" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <CalendarIcon className="w-6 h-6 mb-1" />
          <span>{t('calendar') || 'Events'}</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
          <CogIcon className="w-6 h-6 mb-1" />
          <span>{t('settings') || 'Settings'}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
