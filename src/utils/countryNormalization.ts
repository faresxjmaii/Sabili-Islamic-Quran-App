import type { Language } from '../types';

export type NormalizedCountry = {
  code: string;
  nameEn: string;
  nameIt: string;
  nameAr: string;
};

const COUNTRIES: NormalizedCountry[] = [
  {
    code: 'IT',
    nameEn: 'Italy',
    nameIt: 'Italia',
    nameAr: 'إيطاليا',
  },
  {
    code: 'TN',
    nameEn: 'Tunisia',
    nameIt: 'Tunisia',
    nameAr: 'تونس',
  },
  {
    code: 'FR',
    nameEn: 'France',
    nameIt: 'Francia',
    nameAr: 'فرنسا',
  },
];

const countryAliases = new Map<string, NormalizedCountry>();

function normalizeAlias(input: string) {
  return input
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function registerAliases(country: NormalizedCountry, aliases: string[]) {
  aliases.forEach((alias) => countryAliases.set(normalizeAlias(alias), country));
}

registerAliases(COUNTRIES[0], [
  'it',
  'ita',
  'italy',
  'italia',
  'italie',
  'إيطاليا',
]);

registerAliases(COUNTRIES[1], [
  'tn',
  'tun',
  'tunisia',
  'tunisie',
  'تونس',
]);

registerAliases(COUNTRIES[2], [
  'fr',
  'fra',
  'france',
  'francia',
  'فرنسا',
]);

export function normalizeCountryInput(input: string): NormalizedCountry | null {
  return countryAliases.get(normalizeAlias(input)) ?? null;
}

export function getCountryName(country: NormalizedCountry, language: Language) {
  if (language === 'ar') return country.nameAr;
  if (language === 'it') return country.nameIt;
  return country.nameEn;
}

export function getCountryByCode(code?: string) {
  if (!code) return null;
  return COUNTRIES.find((country) => country.code === code.toUpperCase()) ?? null;
}

export const supportedCountries = COUNTRIES;
