import type { PrayerTimesResponse, ResolvedLocation } from '../types';

const BASE_URL = 'https://api.aladhan.com/v1';

export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = 3,
  school: number = 0,
  date?: string
): Promise<PrayerTimesResponse> {
  const today = date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const url = `${BASE_URL}/timings/${today}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&timezonestring=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);
  return res.json();
}

export async function fetchPrayerTimesByCity(
  city: string,
  country: string,
  method: number = 3,
  school: number = 0,
  date?: string
): Promise<PrayerTimesResponse> {
  const today = date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const url = `${BASE_URL}/timingsByCity/${today}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=${school}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);
  return res.json();
}

export function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(new Error(error.message)),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60 * 1000,
      }
    );
  });
}

export async function reverseGeocodeCoords(
  latitude: number,
  longitude: number,
  accuracy?: number
): Promise<ResolvedLocation> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Current location';
    const country = data.countryName || '';

    return {
      city,
      country,
      displayName: [city, country].filter(Boolean).join(', '),
      latitude,
      longitude,
      accuracy,
    };
  } catch {
    return {
      city: 'Current location',
      country: '',
      displayName: 'Current location',
      latitude,
      longitude,
      accuracy,
    };
  }
}

export const CALCULATION_METHODS = [
  { id: 0, name: 'Shia Ithna-Ashari' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'ISNA (North America)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm Al-Qura, Makkah' },
  { id: 5, name: 'Egyptian General Authority' },
  { id: 7, name: 'Institute of Geophysics, Tehran' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura' },
  { id: 12, name: 'Union Organization Islamic de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
  { id: 15, name: 'Moonsighting Committee Worldwide' },
  { id: 16, name: 'Dubai (UAE)' },
  { id: 21, name: 'Jabatan Kemajuan Islam Malaysia (JAKIM)' },
];

export const MADHAB_OPTIONS = [
  { id: 0, name: 'Shafi / Maliki / Hanbali' },
  { id: 1, name: 'Hanafi' },
];
