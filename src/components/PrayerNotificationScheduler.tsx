import { useEffect, useRef } from 'react';
import { useSettings } from '../app/useSettings';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useI18n } from '../i18n';
import type { PrayerName, PrayerTimes } from '../types';
import {
  getNotificationPermission,
  notificationsSupported,
  playPrayerAlertSound,
} from '../services/prayerNotificationService';

const NOTIFIED_KEY = 'sakina_prayer_notifications_fired';
const SCHEDULED_PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function parsePrayerTime(time?: string) {
  const match = time?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getFiredNotifications() {
  try {
    const stored = localStorage.getItem(NOTIFIED_KEY);
    return stored ? JSON.parse(stored) as Record<string, true> : {};
  } catch {
    return {};
  }
}

function markNotificationFired(id: string) {
  const fired = getFiredNotifications();
  fired[id] = true;
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(fired));
}

function hasNotificationFired(id: string) {
  return Boolean(getFiredNotifications()[id]);
}

function getScheduleId(prayer: PrayerName, reminderOffset: string, date: Date) {
  return `${date.toISOString().slice(0, 10)}-${prayer}-${reminderOffset}`;
}

function getNotificationText(
  prayer: PrayerName,
  prayerName: (name: PrayerName) => string,
  t: (key: 'prayerNotificationBody', params?: Record<string, string | number>) => string
) {
  return t('prayerNotificationBody', { prayer: prayerName(prayer) });
}

export default function PrayerNotificationScheduler() {
  const { settings } = useSettings();
  const { data } = usePrayerTimes();
  const { t, prayerName } = useI18n();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (settings.prayerReminderOffset === 'off' || !data?.data.timings) return;

    const reminderOffset = Number(settings.prayerReminderOffset);
    const timings = data.data.timings as PrayerTimes;
    const now = Date.now();

    SCHEDULED_PRAYERS.forEach((prayer) => {
      const prayerDate = parsePrayerTime(timings[prayer]);
      if (!prayerDate) return;

      const fireDate = new Date(prayerDate.getTime() - (reminderOffset * 60 * 1000));
      const delay = fireDate.getTime() - now;
      const scheduleId = getScheduleId(prayer, settings.prayerReminderOffset, fireDate);

      if (delay <= 0 || hasNotificationFired(scheduleId)) return;

      const timer = window.setTimeout(() => {
        markNotificationFired(scheduleId);
        const message = getNotificationText(prayer, prayerName, t);

        if (notificationsSupported() && getNotificationPermission() === 'granted') {
          try {
            new Notification(message, {
              body: t('notificationBestResults'),
      icon: '/brand/sabili-pwa-icon-192.png',
              tag: scheduleId,
            });
          } catch {
            // Notification construction can fail on some browser/PWA contexts.
          }
        }

        playPrayerAlertSound(settings.prayerAlertSound, prayer).catch(() => {
          // Browsers may block audio unless the user has interacted with the app.
        });
      }, delay);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [data?.data.date.gregorian.date, data?.data.timings, prayerName, settings.prayerAlertSound, settings.prayerReminderOffset, t]);

  return null;
}
