import { BookOpen, Compass, Settings, Wind } from 'lucide-react';
import type { PrayerRow, QuickAction } from './homeTypes';

export const fallbackPrayers: PrayerRow[] = [
  { name: 'Fajr', time: '04:28' },
  { name: 'Sunrise', time: '06:10' },
  { name: 'Dhuhr', time: '13:15' },
  { name: 'Asr', time: '16:46' },
  { name: 'Maghrib', time: '20:29' },
  { name: 'Isha', time: '21:59' },
];

export const quickActions: QuickAction[] = [
  {
    to: '/quran',
    titleKey: 'navQuran',
    subtitleKey: 'quranReflect',
    icon: BookOpen,
    accentClass: 'text-[#F2C66D]',
    surfaceClass: 'bg-[rgba(16,185,129,0.14)]',
  },
  {
    to: '/adhkar',
    titleKey: 'navAdhkar',
    subtitleKey: 'adhkarRemember',
    icon: Wind,
    accentClass: 'text-[#F2C66D]',
    surfaceClass: 'bg-[rgba(217,180,90,0.14)]',
  },
  {
    to: '/qibla',
    titleKey: 'qibla',
    subtitleKey: 'qiblaDirection',
    icon: Compass,
    accentClass: 'text-[#E7F7F0]',
    surfaceClass: 'bg-[rgba(16,185,129,0.10)]',
  },
  {
    to: '/settings',
    titleKey: 'navSettings',
    subtitleKey: 'settingsPrefs',
    icon: Settings,
    accentClass: 'text-[#EAF1FF]',
    surfaceClass: 'bg-[rgba(80,130,190,0.16)]',
  },
];
