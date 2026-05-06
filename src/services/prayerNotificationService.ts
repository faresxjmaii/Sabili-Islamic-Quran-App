export const PRAYER_ALERT_SOUND_URL = '/audio/adhan-allahu-akbar.wav';

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

export async function playPrayerAlertSound() {
  const audio = new Audio(PRAYER_ALERT_SOUND_URL);
  audio.preload = 'auto';
  audio.volume = 0.88;
  await audio.play();
}
