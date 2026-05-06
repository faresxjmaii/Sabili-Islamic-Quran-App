import type { PrayerAlertSound, PrayerName } from '../types';

export const SHORT_PRAYER_ALERT_SOUND_URL = '/audio/adhan-allahu-akbar.wav';
export const FULL_ADHAN_SOUND_URL = '/audio/adhan-full.mp3';
export const FAJR_ADHAN_SOUND_URL = '/audio/adhan-fajr.mp3';

let currentAlertAudio: HTMLAudioElement | null = null;

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestPrayerNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported' as const;
  return Notification.requestPermission();
}

function stopCurrentAlertSound() {
  if (!currentAlertAudio) return;
  currentAlertAudio.pause();
  currentAlertAudio.currentTime = 0;
  currentAlertAudio = null;
}

async function playAudioSource(src: string) {
  stopCurrentAlertSound();
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.volume = 1;
  audio.loop = false;
  currentAlertAudio = audio;
  audio.addEventListener('ended', () => {
    if (currentAlertAudio === audio) currentAlertAudio = null;
  }, { once: true });
  await audio.play();
}

export async function playPrayerAlertSound(
  sound: PrayerAlertSound = 'short',
  prayer?: PrayerName
): Promise<'played' | 'fallback' | 'silent'> {
  stopCurrentAlertSound();

  if (sound === 'silent') {
    return 'silent';
  }

  if (sound === 'short') {
    await playAudioSource(SHORT_PRAYER_ALERT_SOUND_URL);
    return 'played';
  }

  const adhanSource = prayer === 'Fajr' ? FAJR_ADHAN_SOUND_URL : FULL_ADHAN_SOUND_URL;

  try {
    await playAudioSource(adhanSource);
    return 'played';
  } catch {
    await playAudioSource(SHORT_PRAYER_ALERT_SOUND_URL);
    return 'fallback';
  }
}
