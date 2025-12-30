import React from 'react';
import BottomNav from './BottomNav';
import { Translator } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  t: Translator;
}

const Layout: React.FC<LayoutProps> = ({ children, t }) => {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto p-4 animate-fadeIn">
            {children}
        </main>
        
        {/* Fixed Bottom Navigation */}
        <BottomNav t={t} />
    </div>
  );
};

export default Layout;
