export interface PrayerTimes {
  Fajr: string;
  Imsak?: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset?: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
  Firstthird?: string;
  Lastthird?: string;
}

export interface ResolvedLocation {
  city: string;
  country: string;
  displayName: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface PrayerTimesResponse {
  data: {
    timings: PrayerTimes;
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        month: { en: string; ar: string; number: number };
        year: string;
        day: string;
      };
      gregorian: {
        date: string;
        month: { en: string; number: string };
        year: string;
        day: string;
      };
    };
    meta: {
      timezone: string;
      method: { id: number; name: string };
    };
  };
  resolvedLocation?: ResolvedLocation;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface NextPrayer {
  name: PrayerName;
  time: string;
  timeLeft: string;
  timeLeftSeconds: number;
}

export interface Surah {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface ChaptersResponse {
  chapters: Surah[];
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar' | 'it';

export interface UserLocation {
  type: 'auto' | 'manual';
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  calculationMethod: number;
  madhab: number;
  location: UserLocation;
}
