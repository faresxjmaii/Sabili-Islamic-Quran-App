import type { Language } from '../types';
import { getCountryByCode, getCountryName } from './countryNormalization';

const countryCodesByName: Record<string, string> = {
  Algeria: 'DZ',
  France: 'FR',
  Germany: 'DE',
  Italy: 'IT',
  Morocco: 'MA',
  Spain: 'ES',
  Tunisia: 'TN',
  'United Kingdom': 'GB',
  'United States': 'US',
};

function localizeCountry(country: string, language: Language) {
  const code = countryCodesByName[country];
  if (!code || typeof Intl.DisplayNames === 'undefined') return country;

  return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? country;
}

export function formatLocation({
  city,
  country,
  displayName,
  language,
  countryCode,
}: {
  city?: string;
  country?: string;
  displayName?: string;
  language: Language;
  countryCode?: string;
}) {
  const formattedCity = city?.trim();
  const knownCountry = getCountryByCode(countryCode);
  const formattedCountry = knownCountry
    ? getCountryName(knownCountry, language)
    : country?.trim()
      ? localizeCountry(country.trim(), language)
      : '';
  const parts = [formattedCity, formattedCountry].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : displayName;
}
