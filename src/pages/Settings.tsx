import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Bell, BellRing, Download, Smartphone, Volume2 } from 'lucide-react';
import { useSettings } from '../app/useSettings';
import { cn } from '../utils';
import { languageOptions, useI18n, type TranslationKey } from '../i18n';
import type { PrayerAlertSound, PrayerName, PrayerReminderOffset } from '../types';
import {
  getNotificationPermission,
  notificationsSupported,
  playPrayerAlertSound,
  requestPrayerNotificationPermission,
} from '../services/prayerNotificationService';

const reminderOptions: Array<{ value: PrayerReminderOffset; labelKey: 'reminderOff' | 'reminderAtPrayerTime' | 'reminder5Before' | 'reminder10Before' }> = [
  { value: 'off', labelKey: 'reminderOff' },
  { value: '0', labelKey: 'reminderAtPrayerTime' },
  { value: '5', labelKey: 'reminder5Before' },
  { value: '10', labelKey: 'reminder10Before' },
];

const alertSoundOptions: Array<{ value: PrayerAlertSound; labelKey: TranslationKey }> = [
  { value: 'short', labelKey: 'alertSoundShort' },
  { value: 'full', labelKey: 'alertSoundFull' },
  { value: 'silent', labelKey: 'alertSoundSilent' },
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function SettingsPage() {
  const {
    settings,
    setTheme,
    setLanguage,
    setCalculationMethod,
    setMadhab,
    setLocation,
    setPrayerReminderOffset,
    setPrayerAlertSound,
    resetSettings,
  } = useSettings();
  const { t } = useI18n();
  const [notificationPermission, setNotificationPermission] = useState(() => getNotificationPermission());
  const [soundMessage, setSoundMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState('');
  const [isInstalled, setIsInstalled] = useState(() => (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  ));

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallMessage('');
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallMessage(t('appInstalled'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [t]);

  const handleReset = () => {
    if (confirm(t('resetConfirm'))) {
      resetSettings();
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await requestPrayerNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted' && settings.prayerReminderOffset === 'off') {
      setPrayerReminderOffset('0');
    }
  };

  const handleTestSound = async (sound: PrayerAlertSound, prayer?: PrayerName) => {
    setSoundMessage('');
    try {
      const result = await playPrayerAlertSound(sound, prayer);
      if (result === 'fallback') {
        setSoundMessage(t('fullAdhanAudioMissing'));
      }
    } catch {
      setSoundMessage(t('alertSoundBlocked'));
    }
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      setInstallMessage(t('appInstalled'));
      return;
    }

    if (!installPrompt) {
      setInstallMessage(`${t('installPromptUnavailable')} ${t('iphoneInstallInstructions')}`);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      setInstallMessage(
        choice.outcome === 'accepted'
          ? t('appInstalled')
          : t('iphoneInstallInstructions')
      );
    } catch {
      setInstallMessage(t('iphoneInstallInstructions'));
    }
  };

  const notificationStatus =
    notificationPermission === 'unsupported'
      ? t('notificationUnsupported')
      : notificationPermission === 'granted'
        ? t('notificationPermissionGranted')
        : notificationPermission === 'denied'
          ? t('notificationPermissionDenied')
          : t('notificationBestResults');

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
            { id: 0, name: t('shiaMethod') },
            { id: 2, name: t('isnaMethod') },
            { id: 3, name: t('mwlMethod') },
            { id: 4, name: t('ummAlQuraMethod') },
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
          <option value={0}>{t('shafiMadhhab')}</option>
          <option value={1}>{t('hanafiMadhhab')}</option>
        </select>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0F2438]/85 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#10B981]/25 bg-[#10B981]/10 text-[#A7F3D0]">
            <Smartphone className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">{t('installApp')}</h2>
            <p className="mt-1 text-sm leading-6 text-[#B8C4D6]">{t('iphoneInstallInstructions')}</p>
          </div>
        </div>
        <button
          onClick={handleInstallApp}
          disabled={isInstalled}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#F2C66D]/35 bg-[#D9B45A]/12 px-4 text-sm font-bold text-[#F2C66D] transition hover:bg-[#D9B45A]/18 disabled:cursor-default disabled:opacity-60 sm:w-auto"
          type="button"
        >
          <Download className="size-4" />
          {t('installApp')}
        </button>
        {installMessage ? <p className="mt-3 text-sm leading-6 text-[#F4E7C5]">{installMessage}</p> : null}
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0F2438]/85 p-4 shadow-[0_20px_55px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#D9B45A]/25 bg-[#D9B45A]/10 text-[#F2C66D]">
            <BellRing className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-white">{t('prayerNotifications')}</h2>
            <p className="mt-1 text-sm leading-6 text-[#B8C4D6]">{t('notificationBestResults')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleEnableNotifications}
            disabled={!notificationsSupported() || notificationPermission === 'granted'}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#F2C66D]/35 bg-[#D9B45A]/12 px-4 text-sm font-bold text-[#F2C66D] transition hover:bg-[#D9B45A]/18 disabled:cursor-not-allowed disabled:opacity-55"
            type="button"
          >
            <Bell className="size-4" />
            {t('enablePrayerNotifications')}
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#B8C4D6]">{notificationStatus}</p>
        {soundMessage ? <p className="mt-2 text-sm leading-6 text-[#F4E7C5]">{soundMessage}</p> : null}

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-[#DCE5EF]">{t('prayerAlertSound')}</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {alertSoundOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPrayerAlertSound(option.value)}
                className={cn(
                  'min-h-11 rounded-2xl border px-3 text-sm font-semibold transition',
                  settings.prayerAlertSound === option.value
                    ? 'border-emerald-300/35 bg-emerald-400/14 text-[#A7F3D0]'
                    : 'border-white/10 bg-white/[0.04] text-[#DCE5EF] hover:bg-white/[0.07]'
                )}
                type="button"
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => handleTestSound('short')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-4 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18"
            type="button"
          >
            <Volume2 className="size-4" />
            {t('testShortAlert')}
          </button>
          <button
            onClick={() => handleTestSound('full', 'Dhuhr')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-4 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18"
            type="button"
          >
            <Volume2 className="size-4" />
            {t('testFullAdhan')}
          </button>
          <button
            onClick={() => handleTestSound('full', 'Fajr')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-4 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18"
            type="button"
          >
            <Volume2 className="size-4" />
            {t('testFajrAdhan')}
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#B8C4D6]">{t('audioPlaybackNote')}</p>

        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-[#DCE5EF]">{t('reminderTiming')}</h3>
          <div className="grid gap-2 sm:grid-cols-4">
            {reminderOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPrayerReminderOffset(option.value)}
                className={cn(
                  'min-h-11 rounded-2xl border px-3 text-sm font-semibold transition',
                  settings.prayerReminderOffset === option.value
                    ? 'border-emerald-300/35 bg-emerald-400/14 text-[#A7F3D0]'
                    : 'border-white/10 bg-white/[0.04] text-[#DCE5EF] hover:bg-white/[0.07]'
                )}
                type="button"
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>
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
