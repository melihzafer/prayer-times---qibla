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
    <div className="space-y-8">
      <HijriDatePicker
          gregorianDate={selectedDate}
          hijriDate={hijriDate}
          onPrevious={goToPreviousDay}
          onNext={goToNextDay}
          isToday={isToday}
          t={t}
        />
      
      {isToday && (
        <div className="text-center p-8 glass bg-white/40 dark:bg-brand-dark/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 animate-fadeIn">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-4">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            {t('live') || 'Live'}
          </div>
          <p className="text-6xl font-extrabold text-brand-dark dark:text-white font-outfit tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="text-2xl font-light opacity-50 ml-1">:{currentTime.toLocaleTimeString([], { second: '2-digit' })}</span>
          </p>
          {nextPrayer && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20">
              <p className="text-sm font-semibold text-brand-primary dark:text-brand-primary uppercase tracking-widest">
                {t('nextPrayer')} • <span className="font-bold">{t(nextPrayer.name)}</span>
              </p>
              <p className="text-4xl font-extrabold text-brand-dark dark:text-white font-outfit mt-2">
                {countdown}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(prayerTimes).map(([name, time]) => {
          const isActive = isToday && nextPrayer?.name === name;
          return (
            <div
              key={name}
              className={`p-5 rounded-2xl flex justify-between items-center transition-all duration-500 group
                ${isActive
                  ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] scale-[1.02] ring-4 ring-brand-primary/20'
                  : 'glass bg-white/60 dark:bg-brand-dark/60 hover:bg-white/80 dark:hover:bg-brand-dark/80 shadow-sm border border-white/50 dark:border-white/5'
                }`
              }
            >
               <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className={`p-3 rounded-xl transition-colors duration-300 
                    ${isActive ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {prayerIcons[name] || <ClockIcon/>}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg font-outfit tracking-tight">{t(name)}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                      {isActive ? (t('current') || 'Current') : ''}
                    </span>
                  </div>
               </div>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <span className="font-extrabold text-xl font-outfit tracking-tighter">{time}</span>
                  {name !== 'Sunrise' && (
                    <button 
                      onClick={() => togglePrayerNotification(name)} 
                      className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'hover:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      aria-label={t('toggleNotification')}
                    >
                      {user.notificationPrefs[name] 
                        ? <BellIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-primary'}`}/> 
                        : <BellSlashIcon className={`w-5 h-5 ${isActive ? 'text-white/50' : 'text-slate-400'}`}/>
                      }
                    </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerTimesDisplay;