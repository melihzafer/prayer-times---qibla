import { Coordinates } from './types';

export const KAABA_COORDINATES: Coordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
};

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const CALCULATION_METHODS = [
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm Al-Qura (Makkah)' },
  { id: 5, name: 'Egyptian General Authority' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Singapore' },
  { id: 12, name: 'France (UOIF)' },
  { id: 13, name: 'Turkey (Diyanet)' },
  { id: 14, name: 'Russia' },
  { id: 15, name: 'Moonsighting Committee' },
  { id: 17, name: 'Malaysia (JAKIM)' },
  { id: 20, name: 'Indonesia (Kemenag)' },
  { id: 23, name: 'Jordan' },
  // Custom Mappings
  { id: 101, name: 'Bulgaria (uses Diyanet)' },
  { id: 102, name: 'Germany (uses Diyanet)' },
  { id: 103, name: 'Belgium (uses France UOIF)' },
  { id: 104, name: 'Bosnia (uses Diyanet)' },
];

export const CUSTOM_METHOD_MAPPINGS: Record<number, number> = {
  101: 13, // Bulgaria -> Turkey
  102: 13, // Germany -> Turkey
  103: 12, // Belgium -> France
  104: 13, // Bosnia -> Turkey
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ar', name: 'العربية' },
  { code: 'bg', name: 'Български' },
  { code: 'de', name: 'Deutsch' },
];