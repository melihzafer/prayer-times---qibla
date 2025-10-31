import { Coordinates } from './types';

export const KAABA_COORDINATES: Coordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
};

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const CALCULATION_METHODS = [
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm Al-Qura (Makkah)' },
  { id: 5, name: 'Egyptian General Authority' },
  { id: 8, name: 'Kuwait' },
  { id: 9, name: 'Qatar' },
  { id: 10, name: 'Singapore' },
  { id: 11, name: 'Turkey (Diyanet)' },
  { id: 12, name: 'France (UOIF)' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ar', name: 'العربية' },
];