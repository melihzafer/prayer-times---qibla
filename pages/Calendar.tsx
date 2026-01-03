import React from 'react';
import SpecialDaysCalendar from '../components/SpecialDaysCalendar';
import { Translator } from '../types';

interface CalendarProps {
  t: Translator;
}

const Calendar: React.FC<CalendarProps> = ({ t }) => {
  return (
    <div className="space-y-10 animate-fadeIn">
       <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tighter">
            {t('islamicEventsCalendar')}
          </h1>
          <div className="w-12 h-1 bg-brand-primary mx-auto rounded-full"></div>
       </div>

       <div className="glass bg-white/40 dark:bg-brand-dark/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 border border-white/40 dark:border-white/10 overflow-hidden">
          <SpecialDaysCalendar t={t} />
       </div>
    </div>
  );
};

export default Calendar;
