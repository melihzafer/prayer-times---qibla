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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex items-center justify-between">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('previousDay')}
      >
        <ChevronLeftIcon />
      </button>

      <div className="text-center">
        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('gregorianDate', gregorianDate)}</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-600 dark:text-gray-400">{hijriString}</p>
          {isToday && (
            <span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
              {t('today')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('nextDay')}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

export default HijriDatePicker;
