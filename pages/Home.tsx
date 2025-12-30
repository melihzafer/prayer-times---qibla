import React from 'react';
import PrayerTimesDisplay from '../components/PrayerTimesDisplay';
import ContextualHadith from '../components/ContextualHadith';
import NearbyMosques from '../components/NearbyMosques';
import Loader from '../components/Loader';
import { PrayerTimes, HijriDate, NextPrayer, Translator, UserProfile, Coordinates } from '../types';

interface HomeProps {
  loading: string | false;
  error: string | null;
  prayerTimes: PrayerTimes | null;
  hijriDate: HijriDate | null;
  nextPrayer: NextPrayer | null;
  countdown: string;
  selectedDate: Date;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  t: Translator;
  user: UserProfile;
  togglePrayerNotification: (prayerName: string) => void;
  coordinates: Coordinates | null;
  setShowMosquesModal: (show: boolean) => void;
  stableCoordinates: Coordinates | null;
}

const Home: React.FC<HomeProps> = ({
  loading,
  error,
  prayerTimes,
  hijriDate,
  nextPrayer,
  countdown,
  selectedDate,
  goToPreviousDay,
  goToNextDay,
  t,
  user,
  togglePrayerNotification,
  setShowMosquesModal,
  stableCoordinates
}) => {
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('welcomeMessage')}</p>
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
      {nextPrayer && <ContextualHadith currentPrayerName={nextPrayer.name} t={t} />}
      {stableCoordinates && <NearbyMosques onOpenModal={() => setShowMosquesModal(true)} t={t} />}
    </div>
  );
};

export default Home;
