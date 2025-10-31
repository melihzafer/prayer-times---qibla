import React, { useEffect, useState } from 'react';
import { PrayerTimes, HijriDate, NextPrayer, Translator, UserProfile } from '../types';
import { SunIcon, MoonIcon, ClockIcon, BellIcon, BellSlashIcon } from './Icons';
import HijriDatePicker from './HijriDatePicker';

interface PrayerTimesDisplayProps {
  prayerTimes: PrayerTimes;
  hijriDate: HijriDate | null;
  nextPrayer: NextPrayer | null;
  countdown: string;
  selectedDate: Date;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  t: Translator;
  user: UserProfile;
  togglePrayerNotification: (prayerName: string) => void;
}

const prayerIcons: { [key: string]: React.ReactNode } = {
    Fajr: <MoonIcon />,
    Sunrise: <SunIcon />,
    Dhuhr: <SunIcon />,
    Asr: <SunIcon />,
    Maghrib: <MoonIcon />,
    Isha: <MoonIcon />,
};

const PrayerTimesDisplay: React.FC<PrayerTimesDisplayProps> = ({
  prayerTimes,
  hijriDate,
  nextPrayer,
  countdown,
  selectedDate,
  goToPreviousDay,
  goToNextDay,
  t,
  user,
  togglePrayerNotification
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  
  return (
    <div className="space-y-6">
       <HijriDatePicker
          gregorianDate={selectedDate}
          hijriDate={hijriDate}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
          isToday={isToday}
          t={t}
        />
      
      {isToday && (
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-5xl font-bold text-gray-800 dark:text-gray-100 mt-2">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {nextPrayer && (
            <div className="mt-4">
              <p className="text-lg text-blue-600 dark:text-blue-400">
                {t('nextPrayer')} <span className="font-bold">{t(nextPrayer.name)}</span> at {nextPrayer.time}
              </p>
              <p className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-wider mt-2">
                {countdown}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(prayerTimes).map(([name, time]) => (
          <div
            key={name}
            className={`p-4 rounded-lg flex justify-between items-center transition-all duration-300
              ${isToday && nextPrayer?.name === name
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800'
              }`
            }
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
               <div className={`${isToday && nextPrayer?.name === name ? 'text-white' : 'text-blue-500'}`}>{prayerIcons[name] || <ClockIcon/>}</div>
               <span className="font-semibold text-lg">{t(name)}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-mono text-lg">{time}</span>
                {user.isLoggedIn && name !== 'Sunrise' && (
                  <button onClick={() => togglePrayerNotification(name)} aria-label={t('toggleNotification')}>
                    {user.notificationPrefs[name] ? <BellIcon className="w-5 h-5"/> : <BellSlashIcon className="w-5 h-5"/>}
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimesDisplay;