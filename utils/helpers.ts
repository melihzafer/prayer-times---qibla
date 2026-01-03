
import { Coordinates, PrayerTimes, NextPrayer } from '../types';
import { KAABA_COORDINATES, PRAYER_NAMES } from '../constants';

// --- Geo Helpers ---

import { Coordinates as AdhanCoordinates, Qibla } from 'adhan';

export const calculateQiblaDirection = (userCoords: Coordinates): number => {
  const coordinates = new AdhanCoordinates(userCoords.latitude, userCoords.longitude);
  const qibla = Qibla(coordinates);
  return qibla;
};

// --- Time Helpers ---

const parseTimeToDate = (timeStr: string, date: Date): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
};

export const findNextPrayer = (prayerTimes: PrayerTimes, now: Date): NextPrayer | null => {
    const prayerTimesToday = PRAYER_NAMES.map(name => ({
        name,
        date: parseTimeToDate(prayerTimes[name], now)
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const prayer of prayerTimesToday) {
        if (prayer.date > now) {
            return { name: prayer.name, time: prayerTimes[prayer.name], isNextDay: false };
        }
    }
    
    // If all prayers for today have passed, the next prayer is Fajr of the next day
    return { name: 'Fajr', time: prayerTimes['Fajr'], isNextDay: true };
};

export const formatCountdown = (targetTimeStr: string, now: Date, isNextDay: boolean = false): string => {
    let targetDate = parseTimeToDate(targetTimeStr, now);

    if (isNextDay || targetDate < now) {
        // Target is next day
        targetDate.setDate(targetDate.getDate() + 1);
    }
    
    const diff = targetDate.getTime() - now.getTime();
    if (diff < 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
};
