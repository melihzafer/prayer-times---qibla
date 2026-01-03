import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CompassIcon, BookOpenIcon, CalendarIcon, CogIcon } from './Icons';
import { Translator } from '../types';

interface BottomNavProps {
  t: Translator;
}

const BottomNav: React.FC<BottomNavProps> = ({ t }) => {
  const commonClasses = "flex flex-col items-center justify-center w-full h-full text-[10px] font-bold transition-all duration-500 relative group";
  const activeClasses = "text-brand-primary scale-110";
  const inactiveClasses = "text-slate-400 dark:text-slate-500 hover:text-brand-primary/80 transition-colors";

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50 animate-fadeInUp">
      <nav className="glass bg-white/60 dark:bg-brand-dark/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 dark:border-white/10 h-22 px-4 relative overflow-hidden">
        {/* Animated background glow for active item */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -inset-[10%] bg-gradient-to-r from-brand-primary/10 via-brand-accent/5 to-brand-primary/10 blur-3xl animate-shine"></div>
        </div>

        <div className="grid h-full grid-cols-5 font-outfit relative z-10">
          <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-brand-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110' : 'group-hover:scale-110'}`}>
                  <HomeIcon className="w-6 h-6" />
                </div>
                <span className={`mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {t('home') || 'Home'}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_#2563eb] animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="/qibla" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-brand-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110' : 'group-hover:scale-110'}`}>
                  <CompassIcon className="w-6 h-6" />
                </div>
                <span className={`mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {t('qibla') || 'Qibla'}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_#2563eb] animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="/inspiration" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-brand-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110' : 'group-hover:scale-110'}`}>
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <span className={`mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {t('inspiration') || 'Inspire'}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_#2563eb] animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="/calendar" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-brand-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110' : 'group-hover:scale-110'}`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <span className={`mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {t('calendar') || 'Events'}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_#2563eb] animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 transform ${isActive ? 'bg-brand-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-110' : 'group-hover:scale-110'}`}>
                  <CogIcon className="w-6 h-6" />
                </div>
                <span className={`mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {t('settings') || 'Settings'}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_#2563eb] animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
