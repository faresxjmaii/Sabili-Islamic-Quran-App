import { useMemo, useState } from 'react';
import { CheckCircle2, Compass, LocateFixed, MapPin } from 'lucide-react';
import { useI18n } from '../i18n';
import LanguageSelector from './LanguageSelector';
import {
  getCountryName,
  normalizeCountryInput,
  supportedCountries,
} from '../utils/countryNormalization';
import {
  getPlaceCityName,
  getPlaceCountry,
  getPlaceDisplayName,
  getPlaceSuggestions,
  type PlaceSuggestion,
} from '../utils/placeSuggestions';

type LocationPermissionCardProps = {
  onEnable: () => void;
  onUseManual: (city: string, country: string) => void;
  errorMessage?: string;
  isLocating?: boolean;
};

export default function LocationPermissionCard({
  onEnable,
  onUseManual,
  errorMessage,
  isLocating = false,
}: LocationPermissionCardProps) {
  const { language, t } = useI18n();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [formTouched, setFormTouched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);

  const cityValue = selectedPlace ? getPlaceCityName(selectedPlace, language) : city;
  const countryValue = selectedPlace ? getCountryName(getPlaceCountry(selectedPlace), language) : country;
  const suggestions = useMemo(
    () => selectedPlace ? [] : getPlaceSuggestions({ city, country }),
    [city, country, selectedPlace]
  );
  const normalizedCountry = useMemo(
    () => selectedPlace ? getPlaceCountry(selectedPlace) : normalizeCountryInput(country),
    [country, selectedPlace]
  );
  const hasCity = selectedPlace ? true : city.trim().length > 0;
  const canUseManual = hasCity && Boolean(normalizedCountry);
  const showValidation = formTouched && !canUseManual;

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setSelectedPlace(place);
    setCity('');
    setCountry('');
    setFormTouched(false);
  };

  const handleUseManual = () => {
    setFormTouched(true);
    if (!canUseManual || !normalizedCountry) return;
    onUseManual(selectedPlace?.cityApi ?? city, normalizedCountry.nameEn);
  };

  return (
    <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[26px] border border-white/10 bg-[#0F2438]/88 p-4 text-center shadow-[0_22px_70px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:p-6">
      <div className="absolute inset-0 bg-pattern opacity-40" />
      <div className="absolute -right-20 -top-20 size-48 rounded-full bg-[#10B981]/12 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-[#D9B45A]/10 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#07111F]/42 px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#B8C4D6]">
            {t('language')}
          </span>
          <LanguageSelector compact />
        </div>

        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#D9B45A]/25 bg-[#D9B45A]/10 text-[#F2C66D]">
          <LocateFixed className="size-6" />
        </span>
        <h2 className="mt-3 text-xl font-bold text-white sm:text-3xl">{t('locationSetupTitle')}</h2>
        <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-[#B8C4D6]">
          {t('locationSetupSubtitle')}
        </p>

        {errorMessage ? (
          <div className="mx-auto mt-3 rounded-2xl border border-[#F2C66D]/20 bg-[#D9B45A]/10 px-4 py-2.5 text-sm leading-6 text-[#F4E7C5]">
            {errorMessage}
          </div>
        ) : null}

        <button
          onClick={onEnable}
          disabled={isLocating}
          className="group relative mt-4 flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#F2C66D]/35 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-4 py-2.5 text-sm font-bold text-[#07111F] shadow-[0_12px_28px_rgba(217,180,90,0.14)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:text-base"
          type="button"
        >
          <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
          <MapPin className="relative size-5" />
          <span className="relative">{isLocating ? t('detectingLocation') : t('locationUseCurrent')}</span>
        </button>

        <div id="manual-location" className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.035] p-3 text-start sm:p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white sm:text-base">
            <Compass className="size-4 text-[#10B981] sm:size-5" />
            {t('chooseCityManually')}
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#DCE5EF] sm:text-sm">{t('city')}</span>
              <input
                value={cityValue}
                onChange={(event) => {
                  setCity(event.target.value);
                  setSelectedPlace(null);
                  setFormTouched(false);
                }}
                placeholder={t('cityPlaceholder')}
                className="h-11 w-full rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none transition placeholder:text-[#6F8198] focus:border-[#D9B45A]/35"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#DCE5EF] sm:text-sm">{t('country')}</span>
              <input
                value={countryValue}
                onBlur={() => setFormTouched(true)}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setSelectedPlace(null);
                  setFormTouched(false);
                }}
                placeholder={t('countryPlaceholder')}
                list="supported-country-options"
                className="h-11 w-full rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none transition placeholder:text-[#6F8198] focus:border-[#D9B45A]/35"
              />
              <datalist id="supported-country-options">
                {supportedCountries.map((item) => (
                  <option key={item.code} value={getCountryName(item, language)} />
                ))}
              </datalist>
            </label>
          </div>

          {suggestions.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {suggestions.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#07111F]/58 px-3 py-2 text-start text-sm font-semibold text-[#DCE5EF] transition hover:border-[#D9B45A]/30 hover:bg-[#D9B45A]/10 hover:text-white"
                  type="button"
                >
                  <span>{getPlaceDisplayName(place, language)}</span>
                  <CheckCircle2 className="size-4 text-[#10B981]" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-2 min-h-5 text-sm leading-5">
            {showValidation ? (
              <p className="text-[#F4E7C5]">{t('validCityCountryRequired')}</p>
            ) : normalizedCountry && country.trim() ? (
              <p className="inline-flex items-center gap-2 text-[#DCE5EF]">
                <CheckCircle2 className="size-4 text-[#10B981]" />
                {getCountryName(normalizedCountry, language)}
              </p>
            ) : null}
          </div>

          <button
            disabled={!canUseManual}
            onClick={handleUseManual}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-5 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
          >
            <Compass className="size-4" />
            {t('useThisLocation')}
          </button>
        </div>
      </div>
    </section>
  );
}
