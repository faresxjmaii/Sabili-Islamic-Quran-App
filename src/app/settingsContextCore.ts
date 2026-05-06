import { createContext } from 'react';
import type { AppSettings, Language, PrayerAlertSound, PrayerReminderOffset, Theme, UserLocation } from '../types';

export interface SettingsContextValue {
  settings: AppSettings;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setLocation: (location: UserLocation) => void;
  setCalculationMethod: (method: number) => void;
  setMadhab: (madhab: number) => void;
  setPrayerReminderOffset: (offset: PrayerReminderOffset) => void;
  setPrayerAlertSound: (sound: PrayerAlertSound) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
