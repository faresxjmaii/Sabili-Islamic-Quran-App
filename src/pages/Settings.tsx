import { motion } from 'framer-motion';
import { useSettings } from '../app/useSettings';
import { cn } from '../utils';
import { languageOptions, useI18n } from '../i18n';

export default function SettingsPage() {
  const {
    settings,
    setTheme,
    setLanguage,
    setCalculationMethod,
    setMadhab,
    setLocation,
    resetSettings,
  } = useSettings();
  const { t } = useI18n();

  const handleReset = () => {
    if (confirm(t('resetConfirm'))) {
      resetSettings();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      <h1 className="text-2xl font-bold text-center">{t('navSettings')}</h1>
      <p className="mx-auto max-w-xl rounded-2xl border border-[#D9B45A]/20 bg-[#D9B45A]/10 px-4 py-3 text-center text-sm leading-6 text-[#F2C66D]">
        {t('settingsNote')}
      </p>

      <section className="p-4 glass rounded-xl">
        <h2 className="font-medium mb-2">{t('language')}</h2>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              onClick={() => setLanguage(option.code)}
              className={cn(
                'px-3 py-1 rounded-md',
                settings.language === option.code
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="p-4 glass rounded-xl">
        <h2 className="font-medium mb-2">{t('theme')}</h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={cn(
                'px-3 py-1 rounded-md',
                settings.theme === themeName
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              {themeName === 'light' ? t('light') : themeName === 'dark' ? t('dark') : t('system')}
            </button>
          ))}
        </div>
      </section>

      <section className="p-4 glass rounded-xl">
        <h2 className="font-medium mb-2">{t('calculationMethod')}</h2>
        <select
          value={settings.calculationMethod}
          onChange={(e) => setCalculationMethod(Number(e.target.value))}
          className="w-full rounded-md bg-slate-200 dark:bg-slate-700 p-2"
        >
          {[
            { id: 0, name: 'Shia Ithna‑Ashari' },
            { id: 2, name: 'ISNA (North America)' },
            { id: 3, name: 'Muslim World League' },
            { id: 4, name: 'Umm Al‑Qura, Makkah' },
          ].map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </section>

      <section className="p-4 glass rounded-xl">
        <h2 className="font-medium mb-2">{t('madhhab')}</h2>
        <select
          value={settings.madhab}
          onChange={(e) => setMadhab(Number(e.target.value))}
          className="w-full rounded-md bg-slate-200 dark:bg-slate-700 p-2"
        >
          <option value={0}>Shafi / Maliki / Hanbali</option>
          <option value={1}>Hanafi</option>
        </select>
      </section>

      <section className="p-4 glass rounded-xl">
        <h2 className="font-medium mb-2">{t('location')}</h2>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="locType"
              checked={settings.location.type === 'auto'}
              onChange={() => setLocation({ type: 'auto' })}
            />
            {t('autoLocation')}
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="locType"
              checked={settings.location.type === 'manual'}
              onChange={() => setLocation({ type: 'manual', city: '', country: '' })}
            />
            {t('manual')}
          </label>
        </div>
        {settings.location.type === 'manual' && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder={t('city')}
              value={settings.location.city || ''}
              onChange={(e) => setLocation({ ...settings.location, city: e.target.value })}
              className="w-full rounded-md bg-slate-200 dark:bg-slate-700 p-2"
            />
            <input
              type="text"
              placeholder={t('country')}
              value={settings.location.country || ''}
              onChange={(e) => setLocation({ ...settings.location, country: e.target.value })}
              className="w-full rounded-md bg-slate-200 dark:bg-slate-700 p-2"
            />
          </div>
        )}
      </section>

      <section className="p-4 glass rounded-xl text-center">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          {t('resetDefaults')}
        </button>
      </section>
    
    </motion.div>
  );
}
