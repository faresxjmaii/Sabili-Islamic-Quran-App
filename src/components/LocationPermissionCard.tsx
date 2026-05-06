import { useEffect, useState } from 'react';
import { CheckCircle2, Compass, LocateFixed, Loader2, MapPin, Search } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  getPlaceDisplayName,
  searchPlaces,
  type GeocodedPlace,
} from '../services/geocodingService';
import LanguageSelector from './LanguageSelector';

type LocationPermissionCardProps = {
  onEnable: () => void;
  onUseManual: (place: GeocodedPlace) => void;
  errorMessage?: string;
  isLocating?: boolean;
  isResolvingLocation?: boolean;
};

export default function LocationPermissionCard({
  onEnable,
  onUseManual,
  errorMessage,
  isLocating = false,
  isResolvingLocation = false,
}: LocationPermissionCardProps) {
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodedPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [searchError, setSearchError] = useState('');
  const inputValue = selectedPlace ? getPlaceDisplayName(selectedPlace, language) : query;
  const canSubmit = Boolean(selectedPlace) || query.trim().length >= 2;
  const isManualBusy = isResolving || isResolvingLocation;

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (selectedPlace || trimmedQuery.length < 2) return;

    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      searchPlaces(trimmedQuery, language, 5, controller.signal)
        .then((results) => {
          if (active) setSuggestions(results);
        })
        .catch(() => {
          if (active) setSuggestions([]);
        })
        .finally(() => {
          if (active) setIsSearching(false);
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [language, query, selectedPlace]);

  const handleSelectPlace = (place: GeocodedPlace) => {
    setSelectedPlace(place);
    setSuggestions([]);
    setSearchError('');
  };

  const handleUseManual = async () => {
    setSearchError('');

    if (selectedPlace) {
      onUseManual(selectedPlace);
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSearchError(t('placeSearchNotFound'));
      return;
    }

    setIsResolving(true);
    try {
      const [place] = await searchPlaces(trimmedQuery, language, 1);
      if (!place) {
        setSearchError(t('placeSearchNotFound'));
        return;
      }
      setSelectedPlace(place);
      setSuggestions([]);
      onUseManual(place);
    } catch {
      setSearchError(t('placeSearchNotFound'));
    } finally {
      setIsResolving(false);
    }
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

        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.035] p-3 text-start sm:p-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white sm:text-base">
              <Compass className="size-4 text-[#10B981] sm:size-5" />
              {t('chooseCityManually')}
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-[#6F8198] ltr:left-4 rtl:right-4" />
              <input
                value={inputValue}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedPlace(null);
                  setSuggestions([]);
                  setSearchError('');
                  setIsSearching(false);
                }}
                placeholder={t('locationSearchPlaceholder')}
                className="h-11 w-full rounded-2xl border border-white/10 bg-[#07111F]/70 py-2 text-sm text-white outline-none transition placeholder:text-[#6F8198] focus:border-[#D9B45A]/35 ltr:pl-10 ltr:pr-4 rtl:pl-4 rtl:pr-10"
              />
            </div>
          </label>

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
                  <CheckCircle2 className="size-4 shrink-0 text-[#10B981]" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-2 min-h-5 text-sm leading-5">
            {isSearching ? (
              <p className="inline-flex items-center gap-2 text-[#B8C4D6]">
                <Loader2 className="size-4 animate-spin text-[#10B981]" />
                {t('searchingCity')}
              </p>
            ) : searchError ? (
              <p className="text-[#F4E7C5]">{searchError}</p>
            ) : selectedPlace ? (
              <p className="inline-flex items-center gap-2 text-[#DCE5EF]">
                <CheckCircle2 className="size-4 text-[#10B981]" />
                {getPlaceDisplayName(selectedPlace, language)}
              </p>
            ) : null}
          </div>

          <button
            disabled={!canSubmit || isManualBusy}
            onClick={handleUseManual}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-5 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
          >
            {isManualBusy ? <Loader2 className="size-4 animate-spin" /> : <Compass className="size-4" />}
            {t('useThisLocation')}
          </button>
        </div>
      </div>
    </section>
  );
}
