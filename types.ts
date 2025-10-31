export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PrayerTimes {
  [key: string]: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDate {
  date: string;
  day: string;
  weekday: { en: string; ar: string };
  month: { en: string; ar: string };
  year: string;
}

export interface AladhanApiResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      hijri: HijriDate;
    };
  };
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export interface NextPrayer {
  name: string;
  time: string;
  isNextDay?: boolean;
}

export type Translator = (key: string, ...args: any[]) => string;

export interface UserProfile {
  isLoggedIn: boolean;
  name: string;
  notificationPrefs: { [prayerName: string]: boolean };
}

export interface IslamicEvent {
  hijriDate: string;
  gregorianDate: string;
  nameKey: string; // key for translation
}

export interface HadithData {
  id: string;
  hadith_english: string;
  hadith_arabic: string;
  hadith_turkish?: string;
  book: string;
  chapter_english: string;
  refno: string;
}