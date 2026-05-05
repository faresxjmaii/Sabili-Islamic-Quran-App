import LocationPermissionCard from '../components/LocationPermissionCard';
import CompactHeroCard from '../components/home/CompactHeroCard';
import DailyAyahCard from '../components/home/DailyAyahCard';
import { fallbackPrayers } from '../components/home/homeData';
import MobileTopBar from '../components/home/MobileTopBar';
import PrayerTimesCard from '../components/home/PrayerTimesCard';
import QuickActionsCard from '../components/home/QuickActionsCard';
import { useNextPrayer } from '../hooks/useNextPrayer';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useI18n } from '../i18n';
import { formatLocation } from '../utils/formatLocation';

export default function Home() {
  const {
    data,
    isError,
    isFetching,
    needsLocationPermission,
    requestLocation,
    useManualLocation,
    isLocating,
    locationAccessError,
  } = usePrayerTimes();
  const { language, t, prayerName } = useI18n();
  const timings = data?.data.timings;
  const nextPrayer = useNextPrayer(timings);
  const prayers = fallbackPrayers.map((prayer) => ({
    ...prayer,
    time: timings?.[prayer.name] ?? prayer.time,
  }));
  const activePrayer = nextPrayer?.name ?? 'Fajr';
  const countdown = nextPrayer?.timeLeft ?? '00:00:00';
  const locationName = formatLocation({
    city: data?.resolvedLocation?.city,
    country: data?.resolvedLocation?.country,
    displayName: data?.resolvedLocation?.displayName,
    language,
  }) || t('location');
  const hijriDate = data?.data.date.hijri
    ? `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`
    : 'Hijri date';
  const showLocationPrompt = !data && (
    needsLocationPermission ||
    isError ||
    isLocating ||
    isFetching ||
    Boolean(locationAccessError)
  );

  return (
    <div className="relative overflow-hidden bg-[#07111F] pb-28 lg:pb-12">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-40 top-8 size-[30rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 top-1/3 size-[28rem] rounded-full bg-[#D9B45A]/7 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-0">
        <MobileTopBar />

        {showLocationPrompt ? (
          <div className="py-10">
            <LocationPermissionCard
              onEnable={requestLocation}
              onUseManual={useManualLocation}
              isLocating={isLocating}
              errorMessage={
                locationAccessError
                  ? t('locationAccessUnavailable')
                  : isError
                    ? t('prayerTimesUnavailable')
                    : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-8">
            <CompactHeroCard
              prayerName={prayerName(activePrayer)}
              prayerTime={nextPrayer?.time ?? timings?.[activePrayer]}
              countdown={countdown}
              sunriseTime={timings?.Sunrise}
              hijriDate={hijriDate}
              locationName={locationName}
              labels={{
                hijriDate: t('hijriDate'),
                sunrise: t('sunrise'),
                nextPrayer: t('nextPrayer'),
                timeRemaining: t('timeRemaining'),
              }}
            />

            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <PrayerTimesCard prayers={prayers} active={activePrayer} />
              </div>
              <div className="flex flex-col gap-8 lg:col-span-7">
                <DailyAyahCard />
                <QuickActionsCard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
