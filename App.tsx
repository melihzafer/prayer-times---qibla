import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import PrayerTimesDisplay from './components/PrayerTimesDisplay';
import QiblaCompass from './components/QiblaCompass';
import Loader from './components/Loader';
import { usePrayerData } from './hooks/usePrayerData';
import { CALCULATION_METHODS } from './constants';
import { translations } from './i18n';
import { Translator, UserProfile } from './types';
import NearbyMosques from './components/NearbyMosques';
import SpecialDaysCalendar from './components/SpecialDaysCalendar';
import { CalendarDaysIcon } from './components/Icons';
import NotificationToast from './components/NotificationToast';
import HadithOfTheDay from './components/HadithOfTheDay';
import AsmaUlHusna from './components/AsmaUlHusna';


const App: React.FC = () => {
  const {
    state,
    actions
  } = usePrayerData();

  const {
    loading,
    error,
    city,
    prayerTimes,
    hijriDate,
    nextPrayer,
    countdown,
    qiblaDirection,
    method,
    theme,
    language,
    selectedDate,
    user,
    coordinates,
    notification
  } = state;

  const {
    handleSearch,
    requestLocation,
    setMethod,
    toggleTheme,
    setLanguage,
    goToPreviousDay,
    goToNextDay,
    login,
    logout,
    togglePrayerNotification,
    clearNotification,
  } = actions;

  const [showCalendar, setShowCalendar] = useState(false);
  
  const t: Translator = useCallback((key, ...args) => {
    const langTranslations = translations[language] || translations['en'];
    const translation = langTranslations[key] || translations['en'][key] || key;
    if (typeof translation === 'function') {
      return translation(...args);
    }
    return translation as string;
  }, [language]);
  
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);


  const MainContent: React.FC = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <Loader />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {loading === 'Fetching location...' ? t('loadingLocation') : t('loadingPrayerTimes')}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('permissionError')}</p>
        </div>
      );
    }

    if (!prayerTimes) {
      return (
        <div className="text-center p-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('welcome')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('welcomeMessage')}
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        <PrayerTimesDisplay
          prayerTimes={prayerTimes}
          hijriDate={hijriDate}
          nextPrayer={nextPrayer}
          countdown={countdown}
          selectedDate={selectedDate}
          goToPreviousDay={goToPreviousDay}
          goToNextDay={goToNextDay}
          t={t}
          user={user}
          togglePrayerNotification={togglePrayerNotification}
        />
        <QiblaCompass direction={qiblaDirection} t={t} />
        {coordinates && <NearbyMosques coordinates={coordinates} t={t} />}

      </div>
    );
  };

  return (
    <div className={`min-h-screen text-gray-900 dark:text-gray-100 font-sans`}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Header
          city={city}
          onSearch={handleSearch}
          onRequestLocation={requestLocation}
          method={method}
          setMethod={setMethod}
          availableMethods={CALCULATION_METHODS}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={setLanguage}
          t={t}
          user={user}
          login={login}
          logout={logout}
        />
        <main>
          <MainContent />
          <HadithOfTheDay t={t} />
          <AsmaUlHusna t={t} />
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <div className="flex justify-between items-center">
                  <div className='flex items-center space-x-2'>
                    <CalendarDaysIcon />
                    <h2 className="text-xl font-bold">{t('islamicEventsCalendar')}</h2>
                  </div>
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)} 
                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-gray-700 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors"
                  >
                      {showCalendar ? t('hideCalendar') : t('showCalendar')}
                  </button>
              </div>
              {showCalendar && <SpecialDaysCalendar t={t} />}
          </div>
        </main>
        <footer className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
          <p>{t('footerText')}</p>
        </footer>
      </div>
      { notification && <NotificationToast prayerName={t(notification.prayerName)} time={notification.time} onClose={clearNotification} /> }
    </div>
  );
};

export default App;