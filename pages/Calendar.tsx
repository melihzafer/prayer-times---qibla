import React from 'react';
import SpecialDaysCalendar from '../components/SpecialDaysCalendar';
import { Translator } from '../types';

interface CalendarProps {
  t: Translator;
}

const Calendar: React.FC<CalendarProps> = ({ t }) => {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">{t('islamicEventsCalendar')}</h1>
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <SpecialDaysCalendar t={t} />
       </div>
    </div>
  );
};

export default Calendar;
