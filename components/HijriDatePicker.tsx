import React from 'react';
import { HijriDate, Translator } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface HijriDatePickerProps {
  gregorianDate: Date;
  hijriDate: HijriDate | null;
  onPrevious: () => void;
  onNext: () => void;
  isToday: boolean;
  t: Translator;
}

const HijriDatePicker: React.FC<HijriDatePickerProps> = ({
  gregorianDate,
  hijriDate,
  onPrevious,
  onNext,
  isToday,
  t,
}) => {
  const hijriString = hijriDate
    ? `${hijriDate.weekday[t('languageCode') as 'en' | 'ar']} ${hijriDate.day} ${hijriDate.month[t('languageCode') as 'en' | 'ar']} ${hijriDate.year}`
    : '...';

  return (
    <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-6 flex items-center justify-between border border-white/40 dark:border-white/10 group">
      <button
        onClick={onPrevious}
        className="p-3 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 active:scale-90"
        aria-label={t('previousDay')}
      >
        <ChevronLeftIcon />
      </button>

      <div className="text-center space-y-2">
        <p className="font-extrabold font-outfit text-xl text-brand-dark dark:text-white tracking-tight">
          {t('gregorianDate', gregorianDate)}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="text-sm font-medium font-inter text-slate-500 dark:text-slate-400">
            {hijriString}
          </p>
          {isToday && (
            <span className="px-3 py-1 text-[10px] font-black font-outfit text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full uppercase tracking-widest">
              ✨ {t('today')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="p-3 rounded-2xl bg-white/50 dark:bg-brand-dark/50 border border-white/40 dark:border-white/10 text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 active:scale-90"
        aria-label={t('nextDay')}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

export default HijriDatePicker;
