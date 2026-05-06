import type { Language } from '../types';
import {
  getCountryByCode,
  getCountryName,
  normalizeCountryInput,
} from '../utils/countryNormalization';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
    county?: string;
    state?: string;
    province?: string;
    region?: string;
    country?: string;
    country_code?: string;
  };
};

export type GeocodedPlace = {
  id: string;
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  displayName: string;
};

function getPlaceName(result: NominatimResult) {
  const address = result.address;

  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    address?.suburb ||
    address?.city_district ||
    result.name ||
    result.display_name.split(',')[0]?.trim() ||
    ''
  );
}

function getRegion(result: NominatimResult) {
  const address = result.address;
  const region = address?.state || address?.province || address?.region || address?.county;
  const name = getPlaceName(result);

  return region && region !== name ? region : undefined;
}

function expandCountryAlias(query: string) {
  const parts = query.trim().split(/\s+/);
  const lastPart = parts.at(-1);
  const country = lastPart ? normalizeCountryInput(lastPart) : null;

  if (!country || parts.length < 2) return query;
  return [...parts.slice(0, -1), country.nameEn].join(' ');
}

function parseResult(result: NominatimResult): GeocodedPlace | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  const name = getPlaceName(result);
  const countryCode = result.address?.country_code?.toUpperCase();
  const country = result.address?.country || '';

  if (!name || !country || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: String(result.place_id),
    name,
    region: getRegion(result),
    country,
    countryCode,
    latitude,
    longitude,
    displayName: result.display_name,
  };
}

async function fetchPlaces(query: string, language: Language, limit: number, signal?: AbortSignal) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
    dedupe: '1',
    'accept-language': language,
  });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error('Place search failed');
  }

  const data = (await response.json()) as NominatimResult[];
  const seen = new Set<string>();

  return data
    .map(parseResult)
    .filter((place): place is GeocodedPlace => Boolean(place))
    .filter((place) => {
      const key = `${place.name}-${place.countryCode}-${place.latitude.toFixed(3)}-${place.longitude.toFixed(3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function searchPlaces(query: string, language: Language, limit = 5, signal?: AbortSignal) {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const expandedQuery = expandCountryAlias(trimmedQuery);
  const queries = expandedQuery === trimmedQuery ? [trimmedQuery] : [expandedQuery, trimmedQuery];

  for (const candidate of queries) {
    const results = await fetchPlaces(candidate, language, limit, signal);
    if (results.length > 0) return results;
  }

  return [];
}

export function getPlaceCountryName(place: GeocodedPlace, language: Language) {
  const normalizedCountry = getCountryByCode(place.countryCode) ?? normalizeCountryInput(place.country);

  if (normalizedCountry) return getCountryName(normalizedCountry, language);

  if (place.countryCode && typeof Intl.DisplayNames !== 'undefined') {
    return new Intl.DisplayNames([language], { type: 'region' }).of(place.countryCode) ?? place.country;
  }

  return place.country;
}

export function getPlaceDisplayName(place: GeocodedPlace, language: Language) {
  const separator = language === 'ar' ? '\u060C ' : ', ';
  const region = place.region && place.region !== place.name ? `${separator}${place.region}` : '';

  return `${place.name}${region}${separator}${getPlaceCountryName(place, language)}`;
}
