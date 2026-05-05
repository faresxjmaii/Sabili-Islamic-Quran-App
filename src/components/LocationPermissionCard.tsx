import { useState } from 'react';
import { Compass, LocateFixed, MapPin, Search } from 'lucide-react';
import { useSettings } from '../app/useSettings';

type LocationPermissionCardProps = {
  onEnable: () => void;
  errorMessage?: string;
};

export default function LocationPermissionCard({ onEnable, errorMessage }: LocationPermissionCardProps) {
  const { setLocation } = useSettings();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const canUseManual = city.trim().length > 1 && country.trim().length > 1;

  return (
    <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0F2438]/88 p-6 text-center shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
      <div className="absolute inset-0 bg-pattern opacity-50" />
      <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[#10B981]/12 blur-3xl" />
      <div className="relative z-10">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl border border-[#D9B45A]/25 bg-[#D9B45A]/10 text-[#F2C66D]">
          <LocateFixed className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-white">Enable your location</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#B8C4D6]">
          Al Iselm Nour uses your authorised GPS position to calculate accurate local prayer times. No fake default city will be shown.
        </p>

        {errorMessage ? (
          <div className="mx-auto mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onEnable}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#F2C66D]/40 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-5 py-3 text-sm font-bold text-[#07111F] shadow-[0_16px_36px_rgba(217,180,90,0.18)] sm:w-auto"
            type="button"
          >
            <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
            <MapPin className="relative size-4" />
            <span className="relative">Enable Location</span>
          </button>
        </div>

        <div className="mt-7 rounded-[24px] border border-white/10 bg-white/[0.035] p-4 text-left">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Search className="size-4 text-[#10B981]" />
            Choose city manually
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              className="h-12 rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none placeholder:text-[#6F8198]"
            />
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Country"
              className="h-12 rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none placeholder:text-[#6F8198]"
            />
            <button
              disabled={!canUseManual}
              onClick={() => setLocation({ type: 'manual', city: city.trim(), country: country.trim() })}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-5 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
            >
              <Compass className="size-4" />
              Use city
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
