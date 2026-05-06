import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settingsService';
import { SettingsContext } from './settingsContextCore';
import type { AppSettings, Language, PrayerAlertSound, PrayerReminderOffset, Theme, UserLocation } from '../types';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => settingsService.get());

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      const root = document.documentElement;
      if (theme === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', dark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language]);

  const setTheme = (theme: Theme) => {
    setSettings(settingsService.setTheme(theme));
  };

  const setLanguage = (language: Language) => {
    setSettings(settingsService.setLanguage(language));
  };

  const setLocation = (location: UserLocation) => {
    setSettings(settingsService.setLocation(location));
  };

  const setCalculationMethod = (method: number) => {
    setSettings(settingsService.setCalculationMethod(method));
  };

  const setMadhab = (madhab: number) => {
    setSettings(settingsService.setMadhab(madhab));
  };

  const setPrayerReminderOffset = (offset: PrayerReminderOffset) => {
    setSettings(settingsService.setPrayerReminderOffset(offset));
  };

  const setPrayerAlertSound = (sound: PrayerAlertSound) => {
    setSettings(settingsService.setPrayerAlertSound(sound));
  };

  const resetSettings = () => {
    setSettings(settingsService.reset());
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      setTheme,
      setLanguage,
      setLocation,
      setCalculationMethod,
      setMadhab,
      setPrayerReminderOffset,
      setPrayerAlertSound,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
