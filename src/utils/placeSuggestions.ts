import type { Language } from '../types';
import {
  getCountryByCode,
  getCountryName,
  normalizeCountryInput,
  type NormalizedCountry,
} from './countryNormalization';

export type PlaceSuggestion = {
  id: string;
  cityApi: string;
  cityEn: string;
  cityIt: string;
  cityAr: string;
  countryCode: string;
  aliases: string[];
};

const PLACES: PlaceSuggestion[] = [
  {
    id: 'rades-tn',
    cityApi: 'Rades',
    cityEn: 'Radès',
    cityIt: 'Radès',
    cityAr: 'رادس',
    countryCode: 'TN',
    aliases: ['rade', 'rades', 'radès', 'رادس'],
  },
  {
    id: 'tunis-tn',
    cityApi: 'Tunis',
    cityEn: 'Tunis',
    cityIt: 'Tunis',
    cityAr: 'تونس',
    countryCode: 'TN',
    aliases: ['tunis', 'tunisi', 'تونس'],
  },
  {
    id: 'alessandria-it',
    cityApi: 'Alessandria',
    cityEn: 'Alessandria',
    cityIt: 'Alessandria',
    cityAr: 'ألساندريا',
    countryCode: 'IT',
    aliases: ['aless', 'alessandria', 'alexandria', 'ألساندريا'],
  },
  {
    id: 'genova-it',
    cityApi: 'Genova',
    cityEn: 'Genova',
    cityIt: 'Genova',
    cityAr: 'جنوة',
    countryCode: 'IT',
    aliases: ['geno', 'genova', 'genua', 'جنوة'],
  },
];

function normalizeSearch(input: string) {
  return input
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function getCityAliases(place: PlaceSuggestion) {
  return [
    place.cityApi,
    place.cityEn,
    place.cityIt,
    place.cityAr,
    ...place.aliases,
  ].map(normalizeSearch);
}

export function getPlaceCountry(place: PlaceSuggestion): NormalizedCountry {
  const country = getCountryByCode(place.countryCode);
  if (!country) throw new Error(`Unsupported country code: ${place.countryCode}`);
  return country;
}

export function getPlaceCityName(place: PlaceSuggestion, language: Language) {
  if (language === 'ar') return place.cityAr;
  if (language === 'it') return place.cityIt;
  return place.cityEn;
}

export function getPlaceDisplayName(place: PlaceSuggestion, language: Language) {
  const separator = language === 'ar' ? '، ' : ', ';
  return `${getPlaceCityName(place, language)}${separator}${getCountryName(getPlaceCountry(place), language)}`;
}

export function getPlaceSuggestions({
  city,
  country,
  limit = 4,
}: {
  city: string;
  country: string;
  limit?: number;
}) {
  const cityQuery = normalizeSearch(city);
  const countryQuery = country.trim();
  const normalizedCountry = normalizeCountryInput(countryQuery);

  if (!cityQuery && !countryQuery) return [];

  return PLACES
    .map((place) => {
      let score = 0;
      const cityAliases = getCityAliases(place);

      if (cityQuery) {
        if (cityAliases.some((alias) => alias.startsWith(cityQuery))) score += 8;
        else if (cityAliases.some((alias) => alias.includes(cityQuery))) score += 4;
      }

      if (normalizedCountry?.code === place.countryCode) score += cityQuery ? 3 : 2;

      return { place, score };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score || first.place.cityEn.localeCompare(second.place.cityEn))
    .slice(0, limit)
    .map(({ place }) => place);
}
