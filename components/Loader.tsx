
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div className="w-16 h-16 border-4 border-slate-100 dark:border-white/5 border-t-brand-primary rounded-full animate-spin shadow-lg relative z-10"></div>
    </div>
  );
};

export default Loader;
