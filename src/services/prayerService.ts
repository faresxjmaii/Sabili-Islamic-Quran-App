import type { PrayerTimesResponse, ResolvedLocation } from '../types';

const BASE_URL = 'https://api.aladhan.com/v1';
const VALID_CALCULATION_METHODS = new Set([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 21]);
const VALID_SCHOOLS = new Set([0, 1]);

export class PrayerApiError extends Error {
  constructor(message = 'prayerTimesUnavailable') {
    super(message);
    this.name = 'PrayerApiError';
  }
}

export function validateCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function validateManualLocation(city?: string, country?: string): boolean {
  return Boolean(city?.trim() && country?.trim());
}

export function normalizeCalculationMethod(method: unknown): number {
  return typeof method === 'number' && VALID_CALCULATION_METHODS.has(method) ? method : 3;
}

export function normalizeMadhab(school: unknown): number {
  return typeof school === 'number' && VALID_SCHOOLS.has(school) ? school : 0;
}

export function normalizePrayerApiError(): PrayerApiError {
  return new PrayerApiError();
}

function getApiDate(date?: string) {
  return date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
}

async function parsePrayerResponse(res: Response): Promise<PrayerTimesResponse> {
  if (!res.ok) throw normalizePrayerApiError();

  const data = (await res.json()) as PrayerTimesResponse;
  if (!data?.data?.timings || !data.data.date || !data.data.meta) {
    throw normalizePrayerApiError();
  }

  return data;
}

export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = 3,
  school: number = 0,
  date?: string
): Promise<PrayerTimesResponse> {
  if (!validateCoordinates(latitude, longitude)) {
    throw normalizePrayerApiError();
  }

  const today = getApiDate(date);
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    method: String(normalizeCalculationMethod(method)),
    school: String(normalizeMadhab(school)),
  });
  const url = `${BASE_URL}/timings/${today}?${params.toString()}`;

  const res = await fetch(url);
  return parsePrayerResponse(res);
}

export async function fetchPrayerTimesByCity(
  city: string,
  country: string,
  method: number = 3,
  school: number = 0,
  date?: string
): Promise<PrayerTimesResponse> {
  const normalizedCity = city.trim();
  const normalizedCountry = country.trim();

  if (!validateManualLocation(normalizedCity, normalizedCountry)) {
    throw normalizePrayerApiError();
  }

  const today = getApiDate(date);
  const params = new URLSearchParams({
    city: normalizedCity,
    country: normalizedCountry,
    method: String(normalizeCalculationMethod(method)),
    school: String(normalizeMadhab(school)),
  });
  const url = `${BASE_URL}/timingsByCity/${today}?${params.toString()}`;

  const res = await fetch(url);
  return parsePrayerResponse(res);
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
