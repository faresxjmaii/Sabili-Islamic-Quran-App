import type { AppSettings, Theme, Language, PrayerReminderOffset, UserLocation } from '../types';
import { normalizeCalculationMethod, normalizeMadhab } from './prayerService';

const SETTINGS_KEY = 'sakina_settings';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'ar', 'it'];
const SUPPORTED_REMINDER_OFFSETS: PrayerReminderOffset[] = ['off', '0', '5', '10'];

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  calculationMethod: 3,
  madhab: 0,
  prayerReminderOffset: 'off',
  location: {
    type: 'auto',
  },
};

export const settingsService = {
  get(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) return defaultSettings;
      const parsed = JSON.parse(stored);
      const merged = { ...defaultSettings, ...parsed };

      if (!SUPPORTED_LANGUAGES.includes(merged.language)) {
        merged.language = 'en';
      }

      merged.calculationMethod = normalizeCalculationMethod(merged.calculationMethod);
      merged.madhab = normalizeMadhab(merged.madhab);
      if (!SUPPORTED_REMINDER_OFFSETS.includes(merged.prayerReminderOffset)) {
        merged.prayerReminderOffset = 'off';
      }

      return merged;
    } catch {
      return defaultSettings;
    }
  },

  set(settings: Partial<AppSettings>): AppSettings {
    const current = this.get();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },

  reset(): AppSettings {
    localStorage.removeItem(SETTINGS_KEY);
    return defaultSettings;
  },

  setTheme(theme: Theme): AppSettings {
    return this.set({ theme });
  },

  setLanguage(language: Language): AppSettings {
    return this.set({ language });
  },

  setLocation(location: UserLocation): AppSettings {
    return this.set({ location });
  },

  setCalculationMethod(method: number): AppSettings {
    return this.set({ calculationMethod: method });
  },

  setMadhab(madhab: number): AppSettings {
    return this.set({ madhab });
  },

  setPrayerReminderOffset(prayerReminderOffset: PrayerReminderOffset): AppSettings {
    return this.set({ prayerReminderOffset });
  },
};

export { defaultSettings };
