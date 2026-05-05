import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, LocateFixed, MapPin, Navigation, Search, Smartphone } from 'lucide-react';
import { getCurrentPosition, reverseGeocodeCoords, validateCoordinates } from '../services/prayerService';
import { useI18n } from '../i18n';

const KAABA = {
  latitude: 21.422487,
  longitude: 39.826206,
};

type QiblaLocation = {
  latitude: number;
  longitude: number;
  label: string;
  accuracy?: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function calculateQiblaBearing(latitude: number, longitude: number) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA.latitude);
  const deltaLongitude = toRadians(KAABA.longitude - longitude);

  const y = Math.sin(deltaLongitude);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(deltaLongitude);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

async function searchCity(query: string): Promise<QiblaLocation> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not search this city.');
  const data = await res.json();
  const match = data.results?.[0];
  if (!match) throw new Error('City not found. Try city and country, for example: Tunis Tunisia.');

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    label: [match.name, match.country].filter(Boolean).join(', '),
  };
}

export default function QiblaPage() {
  const { t } = useI18n();
  const [location, setLocation] = useState<QiblaLocation | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Use your location or search a city to find the Qibla.');
  const [loading, setLoading] = useState(false);

  const bearing = useMemo(
    () => (location ? calculateQiblaBearing(location.latitude, location.longitude) : null),
    [location]
  );
  const compassRotation = bearing === null ? 0 : normalizeDegrees(bearing - (heading ?? 0));

  const useCurrentLocation = async () => {
    setLoading(true);
    setStatus(t('detectingLocation'));
    try {
      const coords = await getCurrentPosition();
      if (!validateCoordinates(coords.latitude, coords.longitude)) {
        throw new Error('invalid-location');
      }
      const resolved = await reverseGeocodeCoords(coords.latitude, coords.longitude, coords.accuracy);
      const label = resolved.displayName || t('gpsPrayerLocation');
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        label,
      });
      setStatus('Qibla direction calculated from your GPS position.');
    } catch {
      setStatus(t('locationAccessUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setStatus('Searching city...');
    try {
      const result = await searchCity(city.trim());
      setLocation(result);
      setStatus('Qibla direction calculated from city location.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'City search failed.');
    } finally {
      setLoading(false);
    }
  };

  const enableDeviceCompass = async () => {
    try {
      const orientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };

      if (typeof orientationEvent.requestPermission === 'function') {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') {
          setStatus('Compass permission was not granted.');
          return;
        }
      }

      window.addEventListener('deviceorientationabsolute', (event) => {
        if (typeof event.alpha === 'number') setHeading(event.alpha);
      });
      window.addEventListener('deviceorientation', (event) => {
        if (typeof event.alpha === 'number') setHeading(360 - event.alpha);
      });
      setStatus('Device compass enabled. Rotate your phone slowly for best accuracy.');
    } catch {
      setStatus('Device compass is not available in this browser.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] pb-48 lg:pb-16">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-40 top-8 size-[34rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 bottom-28 size-[30rem] rounded-full bg-[#D9B45A]/8 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-12 2xl:px-0">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D9B45A]">Direction to Makkah</p>
          <h1 className="mt-3 text-4xl font-bold text-white lg:text-5xl">Qibla Compass</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#B8C4D6]">
            Use GPS for the most accurate Qibla direction, or search your city manually.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0F2438]/78 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={useCurrentLocation}
                disabled={loading}
                className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#F2C66D]/40 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-5 py-3 text-sm font-bold text-[#07111F] shadow-[0_16px_36px_rgba(217,180,90,0.18)] disabled:opacity-60"
                type="button"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
                <LocateFixed className="relative size-4" />
                <span className="relative">{loading ? t('detectingLocation') : 'Use Current Location'}</span>
              </button>
              <button
                onClick={enableDeviceCompass}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-[#DCE5EF] transition hover:bg-white/[0.08]"
                type="button"
              >
                <Smartphone className="size-4 text-[#10B981]" />
                Phone Compass
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
              <label className="mb-3 block text-sm font-semibold text-white">Search city manually</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleCitySearch();
                  }}
                  placeholder="Tunis Tunisia"
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-[#07111F]/70 px-4 text-sm text-white outline-none placeholder:text-[#6F8198]"
                />
                <button
                  onClick={handleCitySearch}
                  disabled={loading || !city.trim()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 px-5 text-sm font-bold text-[#10B981] transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                >
                  <Search className="size-4" />
                  Search
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-[#07111F]/48 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin className="size-4 text-[#10B981]" />
                {location?.label ?? 'No location selected'}
              </p>
              <p className="text-sm leading-6 text-[#B8C4D6]">{status}</p>
              {location?.accuracy ? (
                <p className="text-xs text-[#7D8DA3]">GPS accuracy: about {Math.round(location.accuracy)} meters.</p>
              ) : null}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative grid min-h-[520px] place-items-center overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,36,56,0.86),rgba(7,17,31,0.94))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.30)]"
          >
            <div className="absolute inset-0 bg-pattern opacity-50" />
            <div className="relative grid size-[290px] place-items-center rounded-full border border-[#D9B45A]/25 bg-[#07111F]/70 shadow-[inset_0_0_70px_rgba(16,185,129,0.10),0_0_70px_rgba(16,185,129,0.10)] sm:size-[360px]">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute inset-12 rounded-full border border-[#D9B45A]/12" />
              <motion.div
                animate={{ rotate: compassRotation }}
                transition={{ type: 'spring', stiffness: 70, damping: 16 }}
                className="absolute inset-0 grid place-items-center"
              >
                <Navigation className="size-28 fill-[#F2C66D] text-[#F2C66D] drop-shadow-[0_0_28px_rgba(242,198,109,0.38)] sm:size-36" />
              </motion.div>
              <Compass className="absolute size-12 text-[#10B981]" />
              <span className="absolute top-5 text-sm font-bold tracking-[0.22em] text-white/70">N</span>
              <span className="absolute bottom-5 text-sm font-bold tracking-[0.22em] text-white/45">S</span>
              <span className="absolute left-6 text-sm font-bold tracking-[0.22em] text-white/45">W</span>
              <span className="absolute right-6 text-sm font-bold tracking-[0.22em] text-white/45">E</span>
            </div>

            <div className="relative mt-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D9B45A]">Qibla Bearing</p>
              <p className="mt-2 text-4xl font-bold tabular-nums text-white">
                {bearing === null ? '--' : `${Math.round(bearing)}°`}
              </p>
              <p className="mt-2 text-sm text-[#B8C4D6]">
                {heading === null ? 'Bearing from true north.' : 'Compass adjusted using phone heading.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
