import type { LucideIcon } from 'lucide-react';
import type { TranslationKey } from '../../i18n';

export type PrayerRow = {
  name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
};

export type QuickAction = {
  to: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: LucideIcon;
  accentClass: string;
  surfaceClass: string;
};
