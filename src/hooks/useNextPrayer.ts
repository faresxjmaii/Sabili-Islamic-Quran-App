import { useEffect, useMemo, useState } from 'react';
import { differenceInSeconds, format, isAfter, parse } from 'date-fns';
import type { NextPrayer, PrayerName, PrayerTimes } from '../types';

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function parseTime(timeStr: string): Date {
  const today = format(new Date(), 'yyyy-MM-dd');
  return parse(`${today} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((value) => String(value).padStart(2, '0')).join(':');
}

function computeNextPrayer(timings: PrayerTimes | undefined, now: Date): NextPrayer | null {
  if (!timings) return null;

  for (const name of PRAYER_ORDER) {
    const prayerTime = parseTime(timings[name]);
    if (isAfter(prayerTime, now)) {
      const secondsLeft = differenceInSeconds(prayerTime, now);
      return {
        name,
        time: timings[name],
        timeLeft: formatCountdown(secondsLeft),
        timeLeftSeconds: secondsLeft,
      };
    }
  }

  const fajrTomorrow = parseTime(timings.Fajr);
  fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
  const secondsLeft = differenceInSeconds(fajrTomorrow, now);

  return {
    name: 'Fajr',
    time: timings.Fajr,
    timeLeft: formatCountdown(secondsLeft),
    timeLeftSeconds: secondsLeft,
  };
}

export function useNextPrayer(timings: PrayerTimes | undefined): NextPrayer | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => computeNextPrayer(timings, now), [timings, now]);
}
