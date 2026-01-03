import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Qibla from './pages/Qibla';
import Inspiration from './pages/Inspiration';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Loader from './components/Loader';
import { usePrayerData } from './hooks/usePrayerData';
import { CALCULATION_METHODS } from './constants';
import { translations } from './i18n';
import { Translator } from './types';
import NotificationToast from './components/NotificationToast';
import MosquesModal from './components/MosquesModal';


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

  const [showMosquesModal, setShowMosquesModal] = useState(false);
  
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

  // Stabilize coordinates to prevent NearbyMosques from remounting
  const stableCoordinates = useMemo(() => coordinates, [
    coordinates?.latitude,
    coordinates?.longitude
  ]);


  return (
    <Router>
      <Layout t={t}>
        <Routes>
          <Route path="/" element={
            <Home 
              loading={loading}
              error={error}
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
              coordinates={coordinates}
              setShowMosquesModal={setShowMosquesModal}
              stableCoordinates={stableCoordinates}
            />
          } />
          
          <Route path="/qibla" element={<Qibla direction={qiblaDirection} location={coordinates} t={t} />} />
          
          <Route path="/inspiration" element={<Inspiration t={t} />} />
          
          <Route path="/calendar" element={<Calendar t={t} />} />
          
          <Route path="/settings" element={
            <Settings 
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
          } />
        </Routes>
        
        {notification && <NotificationToast prayerName={t(notification.prayerName)} time={notification.time} onClose={clearNotification} />}
        
        {stableCoordinates && (
            <MosquesModal
            isOpen={showMosquesModal}
            coordinates={stableCoordinates}
            t={t}
            onClose={() => setShowMosquesModal(false)}
            />
        )}
      </Layout>
    </Router>
  );
};

export default App;