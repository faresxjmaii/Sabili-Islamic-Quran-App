import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, LocateFixed, MapPin, Navigation, Search, Smartphone } from 'lucide-react';
import { useSettings } from '../app/useSettings';
import { getCurrentPosition, reverseGeocodeCoords, validateCoordinates } from '../services/prayerService';
import { useI18n } from '../i18n';

const KAABA = {
  latitude: 21.422487,
  longitude: 39.826206,
};

const ALIGNMENT_THRESHOLD = 5;
const ALIGNMENT_RESET_THRESHOLD = 12;

type QiblaLocation = {
  latitude: number;
  longitude: number;
  label: string;
  accuracy?: number;
};

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
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

function getAngleDifference(qiblaBearing: number, phoneHeading: number) {
  return ((qiblaBearing - phoneHeading + 540) % 360) - 180;
}

function smoothHeading(previous: number | null, next: number) {
  if (previous === null) return next;
  const delta = getAngleDifference(next, previous);
  return normalizeDegrees(previous + delta * 0.18);
}

function calculateQiblaBearing(latitude: number, longitude: number) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA.latitude);
  const deltaLongitude = toRadians(KAABA.longitude - longitude);

  const y = Math.sin(deltaLongitude) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLongitude);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

function getHeadingFromOrientation(event: OrientationEventWithCompass) {
  if (typeof event.webkitCompassHeading === 'number') {
    return normalizeDegrees(event.webkitCompassHeading);
  }

  if (event.absolute && typeof event.alpha === 'number') {
    return normalizeDegrees(360 - event.alpha);
  }

  if (typeof event.alpha === 'number') {
    return normalizeDegrees(360 - event.alpha);
  }

  return null;
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

function KaabaMarker({ aligned }: { aligned: boolean }) {
  return (
    <div
      className={[
        'relative grid size-16 place-items-center rounded-[18px] border shadow-[0_18px_44px_rgba(0,0,0,0.28)] transition',
        aligned
          ? 'border-emerald-300/45 bg-emerald-400/18 text-[#A7F3D0]'
          : 'border-[#D9B45A]/35 bg-[#D9B45A]/12 text-[#F2C66D]',
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="absolute inset-3 rounded-[5px] bg-current opacity-90" />
      <div className="absolute inset-x-3 top-5 h-1.5 rounded-full bg-[#07111F]/82" />
      <div className="absolute bottom-3 h-2.5 w-4 rounded-t-full border border-[#07111F]/82 bg-[#07111F]/72" />
    </div>
  );
}

export default function QiblaPage() {
  const { t, isRtl } = useI18n();
  const { settings } = useSettings();
  const [location, setLocation] = useState<QiblaLocation | null>(() => {
    if (!validateCoordinates(settings.location.latitude, settings.location.longitude)) return null;
    return {
      latitude: settings.location.latitude as number,
      longitude: settings.location.longitude as number,
      accuracy: settings.location.accuracy,
      label: settings.location.displayName || settings.location.city || t('savedLocation'),
    };
  });
  const [heading, setHeading] = useState<number | null>(null);
  const headingRef = useRef<number | null>(null);
  const alignedVibrationRef = useRef(false);
  const orientationCleanupRef = useRef<(() => void) | null>(null);
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [compassUnsupported, setCompassUnsupported] = useState(false);
  const [city, setCity] = useState('');
  const [status, setStatus] = useState(t('qiblaIntroStatus'));
  const [loading, setLoading] = useState(false);

  const bearing = useMemo(
    () => (location ? calculateQiblaBearing(location.latitude, location.longitude) : null),
    [location]
  );
  const angleToQibla = bearing !== null && heading !== null
    ? getAngleDifference(bearing, heading)
    : null;
  const qiblaMarkerRotation = angleToQibla ?? 0;
  const compassRingRotation = heading === null ? 0 : -heading;
  const isAligned = angleToQibla !== null && Math.abs(angleToQibla) <= ALIGNMENT_THRESHOLD;
  const turnLabel = angleToQibla === null
    ? t('bearingFromNorth')
    : isAligned
      ? t('qiblaAligned')
      : angleToQibla > 0
        ? t('qiblaTurnRight', { degrees: Math.round(Math.abs(angleToQibla)) })
        : t('qiblaTurnLeft', { degrees: Math.round(Math.abs(angleToQibla)) });

  useEffect(() => {
    if (isAligned && !alignedVibrationRef.current) {
      navigator.vibrate?.([80, 60, 80]);
      alignedVibrationRef.current = true;
    }

    if (angleToQibla !== null && Math.abs(angleToQibla) > ALIGNMENT_RESET_THRESHOLD) {
      alignedVibrationRef.current = false;
    }
  }, [angleToQibla, isAligned]);

  useEffect(() => {
    return () => {
      orientationCleanupRef.current?.();
    };
  }, []);

  const updateHeading = (nextHeading: number) => {
    const smoothed = smoothHeading(headingRef.current, nextHeading);
    headingRef.current = smoothed;
    setHeading(smoothed);
  };

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
      setStatus(t('qiblaGpsCalculated'));
    } catch {
      setStatus(t('locationAccessUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setStatus(t('searchingCity'));
    try {
      const result = await searchCity(city.trim());
      setLocation(result);
      setStatus(t('qiblaCityCalculated'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'City search failed.');
    } finally {
      setLoading(false);
    }
  };

  const enableDeviceCompass = async () => {
    try {
      if (!('DeviceOrientationEvent' in window)) {
        setCompassUnsupported(true);
        setStatus(t('compassUnavailable'));
        return;
      }

      const orientationEvent = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };

      if (typeof orientationEvent.requestPermission === 'function') {
        const permission = await orientationEvent.requestPermission();
        if (permission !== 'granted') {
          setStatus(t('compassPermissionDenied'));
          return;
        }
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        const nextHeading = getHeadingFromOrientation(event as OrientationEventWithCompass);
        if (nextHeading !== null) {
          updateHeading(nextHeading);
        }
      };

      orientationCleanupRef.current?.();
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      orientationCleanupRef.current = () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
      setCompassEnabled(true);
      setCompassUnsupported(false);
      setStatus(t('compassEnabled'));
    } catch {
      setCompassUnsupported(true);
      setStatus(t('compassUnavailable'));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] pb-48 lg:pb-16">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-40 top-8 size-[34rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 bottom-28 size-[30rem] rounded-full bg-[#D9B45A]/8 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-12 2xl:px-0">
        <div className="mb-8 text-center">
          <p className={`${isRtl ? 'label-ui-ar no-arabic-uppercase text-[13px]' : 'text-xs font-semibold uppercase tracking-[0.24em]'} text-[#D9B45A]`}>{t('directionToMakkah')}</p>
          <h1 className="mt-3 text-4xl font-bold text-white lg:text-5xl">{t('qiblaCompass')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#B8C4D6]">
            {t('qiblaHelperText')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0F2438]/78 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:p-8">
            <div className="flex flex-col gap-3">
              <button
                onClick={useCurrentLocation}
                disabled={loading}
                className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#F2C66D]/40 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-5 py-3 text-sm font-bold text-[#07111F] shadow-[0_16px_36px_rgba(217,180,90,0.18)] disabled:opacity-60"
                type="button"
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
                <LocateFixed className="relative size-4" />
                <span className="relative">{loading ? t('detectingLocation') : t('useCurrentLocation')}</span>
              </button>
              <button
                onClick={enableDeviceCompass}
                disabled={compassEnabled}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-[#DCE5EF] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <Smartphone className="size-4 text-[#10B981]" />
                {compassEnabled ? t('compassEnabledShort') : t('enableCompass')}
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
              <label className="mb-3 block text-sm font-semibold text-white">{t('searchCityManually')}</label>
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
                  {t('search')}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-[#07111F]/48 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin className="size-4 text-[#10B981]" />
                {location?.label ?? t('noLocationSelected')}
              </p>
              <p className="text-sm leading-6 text-[#B8C4D6]">{status}</p>
              {compassUnsupported ? (
                <p className="text-sm leading-6 text-[#F4E7C5]">{t('qiblaFallbackOnly')}</p>
              ) : null}
              {location?.accuracy ? (
                <p className="text-xs text-[#7D8DA3]">{t('gpsAccuracy', { meters: Math.round(location.accuracy) })}</p>
              ) : null}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative grid min-h-[560px] place-items-center overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,rgba(15,36,56,0.86),rgba(7,17,31,0.94))] px-5 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.30)]"
          >
            <div className="absolute inset-0 bg-pattern opacity-50" />
            <div className="relative grid size-[300px] place-items-center rounded-full border border-[#D9B45A]/25 bg-[#07111F]/70 shadow-[inset_0_0_70px_rgba(16,185,129,0.10),0_0_70px_rgba(16,185,129,0.10)] sm:size-[390px]">
              <div className="absolute inset-0">
                <div className="absolute left-1/2 top-[8%] h-[43%] w-1 origin-bottom -translate-x-1/2 rounded-full bg-white/25" />
                <Navigation className="absolute left-1/2 top-[5%] size-7 -translate-x-1/2 fill-white/80 text-white/80 drop-shadow-[0_0_18px_rgba(255,255,255,0.22)]" />
              </div>

              <motion.div
                animate={{ rotate: compassRingRotation }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                className="absolute inset-0 rounded-full"
              >
                <div className="absolute inset-5 rounded-full border border-white/10" />
                <div className="absolute inset-12 rounded-full border border-[#D9B45A]/12" />
                <span className="absolute left-1/2 top-5 -translate-x-1/2 text-sm font-bold tracking-[0.22em] text-white/70">N</span>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-bold tracking-[0.22em] text-white/45">S</span>
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold tracking-[0.22em] text-white/45">W</span>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold tracking-[0.22em] text-white/45">E</span>
              </motion.div>

              <motion.div
                animate={{ rotate: qiblaMarkerRotation }}
                transition={{ type: 'spring', stiffness: 70, damping: 16 }}
                className="absolute inset-0"
              >
                <div
                  className={[
                    'absolute left-1/2 top-1/2 h-[42%] w-1.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_0_24px_rgba(242,198,109,0.28)] transition',
                    isAligned ? 'bg-[#10B981]' : 'bg-[#F2C66D]',
                  ].join(' ')}
                />
                <Navigation
                  className={[
                    'absolute left-1/2 top-[10%] size-9 -translate-x-1/2 transition',
                    isAligned
                      ? 'fill-[#10B981] text-[#10B981] drop-shadow-[0_0_22px_rgba(16,185,129,0.45)]'
                      : 'fill-[#F2C66D] text-[#F2C66D] drop-shadow-[0_0_22px_rgba(242,198,109,0.38)]',
                  ].join(' ')}
                />
              </motion.div>

              <div className="absolute inset-[88px] rounded-full border border-white/10 bg-[#07111F]/78 sm:inset-[116px]" />
              <KaabaMarker aligned={isAligned} />
              <Compass className="absolute bottom-10 size-8 text-[#10B981]/80" />
            </div>

            <div className="relative mt-7 text-center">
              <p className={`${isRtl ? 'label-ui-ar no-arabic-uppercase text-[13px]' : 'text-sm font-semibold uppercase tracking-[0.2em]'} ${isAligned ? 'text-[#10B981]' : 'text-[#D9B45A]'}`}>
                {turnLabel}
              </p>
              <div className="mt-5 grid gap-3 text-left sm:grid-cols-3 rtl:text-right">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8DA3]">{t('qiblaBearing')}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">{bearing === null ? '--' : `${Math.round(bearing)}°`}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8DA3]">{t('qiblaCurrentHeading')}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">{heading === null ? '--' : `${Math.round(heading)}°`}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7D8DA3]">{t('qiblaAngleDifference')}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-white">{angleToQibla === null ? '--' : `${Math.round(angleToQibla)}°`}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#B8C4D6]">
                {heading === null ? t('qiblaNeedCompass') : t('bearingWithCompass')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
