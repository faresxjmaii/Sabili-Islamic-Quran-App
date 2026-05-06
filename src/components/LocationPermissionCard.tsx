import { useMemo, useState } from 'react';
import { CheckCircle2, Compass, LocateFixed, MapPin, Search } from 'lucide-react';
import { useI18n } from '../i18n';
import {
  getCountryName,
  normalizeCountryInput,
  supportedCountries,
} from '../utils/countryNormalization';

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
  const [countryTouched, setCountryTouched] = useState(false);

  const normalizedCountry = useMemo(() => normalizeCountryInput(country), [country]);
  const hasCity = city.trim().length > 1;
  const hasCountryInput = country.trim().length > 0;
  const countryIsInvalid = countryTouched && hasCountryInput && !normalizedCountry;
  const canUseManual = hasCity && Boolean(normalizedCountry);

  const handleUseManual = () => {
    setCountryTouched(true);
    if (!canUseManual || !normalizedCountry) return;
    onUseManual(city, normalizedCountry.nameEn);
  };

  return (
    <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0F2438]/88 p-5 text-center shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-7">
      <div className="absolute inset-0 bg-pattern opacity-45" />
      <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[#10B981]/12 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 size-56 rounded-full bg-[#D9B45A]/10 blur-3xl" />
      <div className="relative z-10">
        <span className="mx-auto grid size-14 place-items-center rounded-3xl border border-[#D9B45A]/25 bg-[#D9B45A]/10 text-[#F2C66D]">
          <LocateFixed className="size-7" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{t('locationSetupTitle')}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#B8C4D6] sm:text-base">
          {t('locationSetupSubtitle')}
        </p>

        {errorMessage ? (
          <div className="mx-auto mt-5 rounded-2xl border border-[#F2C66D]/20 bg-[#D9B45A]/10 px-4 py-3 text-sm leading-6 text-[#F4E7C5]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onEnable}
            disabled={isLocating}
            className="group relative flex min-h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#F2C66D]/35 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-4 py-3 text-sm font-bold text-[#07111F] shadow-[0_12px_28px_rgba(217,180,90,0.14)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:text-base"
            type="button"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
            <MapPin className="relative size-5" />
            <span className="relative">{isLocating ? t('detectingLocation') : t('locationUseCurrent')}</span>
          </button>

          <a
            href="#manual-location"
            className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:bg-white/[0.07] sm:text-base"
          >
            <Search className="size-5 text-[#10B981]" />
            {t('chooseCityManually')}
          </a>
        </div>

        <div id="manual-location" className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-4 text-start">
          <p className="mb-3 flex items-center gap-2 text-base font-semibold text-white">
            <Compass className="size-5 text-[#10B981]" />
            {t('chooseCityManually')}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#DCE5EF]">{t('city')}</span>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={t('cityPlaceholder')}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none transition placeholder:text-[#6F8198] focus:border-[#D9B45A]/35 sm:text-base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#DCE5EF]">{t('country')}</span>
              <input
                value={country}
                onBlur={() => setCountryTouched(true)}
                onChange={(event) => {
                  setCountry(event.target.value);
                  if (countryTouched) setCountryTouched(false);
                }}
                placeholder={t('countryPlaceholder')}
                list="supported-country-options"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none transition placeholder:text-[#6F8198] focus:border-[#D9B45A]/35 sm:text-base"
              />
              <datalist id="supported-country-options">
                {supportedCountries.map((item) => (
                  <option key={item.code} value={getCountryName(item, language)} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="mt-3 min-h-6 text-sm leading-6 text-[#B8C4D6]">
            {countryIsInvalid ? (
              <p className="text-[#F4E7C5]">{t('validCountryRequired')}</p>
            ) : normalizedCountry ? (
              <p className="inline-flex items-center gap-2 text-[#DCE5EF]">
                <CheckCircle2 className="size-4 text-[#10B981]" />
                {getCountryName(normalizedCountry, language)}
              </p>
            ) : null}
          </div>

          <button
            disabled={!canUseManual}
            onClick={handleUseManual}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-5 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:text-base"
            type="button"
          >
            <Compass className="size-5" />
            {t('useCityManually')}
          </button>
        </div>
      </div>
    </section>
  );
}
