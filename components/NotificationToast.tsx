import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BellIcon } from './Icons';

interface NotificationToastProps {
  prayerName: string;
  time: string;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ prayerName, time, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 500);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const portalRoot = document.getElementById('notification-portal');
  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[1000] p-6 rounded-[2rem] glass bg-white/90 dark:bg-brand-dark/90 border border-white/40 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative p-4 rounded-2xl bg-brand-primary/10 text-brand-primary shadow-inner">
            <BellIcon className="h-7 w-7" />
          </div>
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="text-base font-black font-outfit text-brand-dark dark:text-white tracking-tight leading-tight">
            It's time for prayer!
          </p>
          <p className="text-sm font-medium font-inter text-slate-500 dark:text-slate-400">
            <span className="text-brand-primary font-bold">{prayerName}</span> is at <span className="font-bold">{time}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 text-slate-400 hover:text-brand-dark dark:hover:text-white transition-all duration-300 group"
          aria-label="Close"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-6 right-6 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-primary rounded-full transition-all duration-[6000ms] ease-linear"
          style={{ width: visible ? '100%' : '0%' }}
        ></div>
      </div>
    </div>,
    portalRoot
  );
};

export default NotificationToast;