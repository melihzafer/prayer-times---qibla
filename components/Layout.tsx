import React from 'react';
import BottomNav from './BottomNav';
import { Translator } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  t: Translator;
}

const Layout: React.FC<LayoutProps> = ({ children, t }) => {
  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-brand-dark text-brand-dark dark:text-white transition-colors duration-500 font-inter outline-none">
        {/* Animated Background Orbs (Visual flair) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto p-4 relative z-10 transition-all duration-300">
            {children}
        </main>
        
        {/* Fixed Bottom Navigation */}
        <BottomNav t={t} />
    </div>
  );
};

export default Layout;
