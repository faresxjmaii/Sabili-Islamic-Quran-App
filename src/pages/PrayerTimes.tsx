import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CalendarDays,
  Clock3,
  CloudSun,
  Compass,
  MapPin,
  Moon,
  Share2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useNextPrayer } from '../hooks/useNextPrayer';
import { formatTime12h } from '../utils';
import LocationPermissionCard from '../components/LocationPermissionCard';
import { useI18n, type TranslationKey } from '../i18n';
import type { PrayerName } from '../types';

type PrayerItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  accent: string;
};

const prayerItems: PrayerItem[] = [
  { key: 'Fajr', label: 'Fajr', icon: Sunrise, accent: '#10B981' },
  { key: 'Sunrise', label: 'Sunrise', icon: Sun, accent: '#F2C66D' },
  { key: 'Dhuhr', label: 'Dhuhr', icon: CloudSun, accent: '#38BDF8' },
  { key: 'Asr', label: 'Asr', icon: Sun, accent: '#D9B45A' },
  { key: 'Sunset', label: 'Sunset', icon: Sunset, accent: '#F2C66D' },
  { key: 'Maghrib', label: 'Maghrib', icon: Moon, accent: '#10B981' },
  { key: 'Isha', label: 'Isha', icon: Moon, accent: '#8BDECB' },
  { key: 'Imsak', label: 'Imsak', icon: Clock3, accent: '#C6D3E3' },
  { key: 'Midnight', label: 'Midnight', icon: Sparkles, accent: '#A7F3D0' },
  { key: 'Firstthird', label: 'First third', icon: Clock3, accent: '#D9B45A' },
  { key: 'Lastthird', label: 'Last third', icon: Moon, accent: '#F2C66D' },
];

const fallbackTimes: Record<string, string> = {
  Fajr: '04:34',
  Sunrise: '06:09',
  Dhuhr: '13:22',
  Asr: '17:20',
  Sunset: '20:36',
  Maghrib: '20:36',
  Isha: '22:12',
  Imsak: '04:24',
  Midnight: '01:23',
  Firstthird: '23:47',
  Lastthird: '02:58',
};

const extraPrayerLabelKeys: Record<string, TranslationKey> = {
  Sunset: 'sunset',
  Imsak: 'imsak',
  Midnight: 'midnight',
  Firstthird: 'firstThird',
  Lastthird: 'lastThird',
};

function displayPrayerLabel(key: string, prayerName: (name: PrayerName) => string, t: (key: TranslationKey) => string) {
  if (['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key)) {
    return prayerName(key as PrayerName);
  }

  return extraPrayerLabelKeys[key] ? t(extraPrayerLabelKeys[key]) : key.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function ActionButton({
  icon: Icon,
  label,
  strong = false,
  to,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  strong?: boolean;
  to?: string;
  onClick?: () => void;
}) {
  const className = strong
    ? 'group relative flex min-h-12 items-center justify-center overflow-hidden rounded-2xl border border-[#F2C66D]/40 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-3 py-3 text-xs font-bold text-[#07111F] shadow-[0_16px_36px_rgba(217,180,90,0.18)] sm:px-5 sm:text-sm'
    : 'group relative flex min-h-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0F2438]/85 px-3 py-3 text-xs font-semibold text-[#DCE5EF] shadow-[0_14px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-5 sm:text-sm';
  const content = (
    <>
      <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
      <span className="relative flex items-center gap-2">
        <Icon className="size-4" />
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link to={to} className={className}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      type="button"
      onClick={onClick}
    >
      {content}
    </motion.button>
  );
}

function PrayerCardDecor() {
  return (
    <>
      <div className="absolute inset-0 bg-pattern opacity-35" />
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#064E3B]/80 blur-sm" />
      <div className="absolute right-8 top-8 size-20 rounded-full border border-[#F2C66D]/20" />
      <div className="absolute right-3 top-12 size-24 rounded-full bg-[#064E3B]/85" />
      <div className="absolute right-14 top-[92px] size-2 rounded-full bg-[#F2C66D] shadow-[0_0_22px_rgba(242,198,109,0.85)]" />
      <div className="absolute bottom-0 left-0 h-28 w-full text-white/10">
        <svg viewBox="0 0 720 180" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path
            fill="currentColor"
            d="M0 180V92h46V58h16v34h36V72c0-29 31-55 64-55s64 26 64 55v20h34V48h16v44h43v88H0Zm344 0V96h44V59h16v37h38v-5c0-31 36-61 72-61s72 30 72 61v5h38V53h16v43h44v84H344Z"
          />
        </svg>
      </div>
      <div className="absolute bottom-7 right-8 hidden text-[#F2C66D]/45 sm:block">
        <div className="mx-auto h-3 w-8 rounded-t-full border border-current" />
        <div className="relative h-20 w-12 rounded-b-2xl rounded-t-lg border border-current bg-[#F2C66D]/10">
          <span className="absolute left-1/2 top-5 h-9 w-4 -translate-x-1/2 rounded-full bg-[#F2C66D]/35 blur-sm" />
        </div>
      </div>
    </>
  );
}

export default function PrayerTimesPage() {
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
  const next = useNextPrayer(data?.data?.timings);
  const { t, prayerName, isRtl } = useI18n();
  const [toast, setToast] = useState('');
  const timings = data?.data?.timings;
  const locationLabel = data?.resolvedLocation?.displayName ?? t('allowLocation');
  const dateLabel = data?.data.date.readable ?? t('today');
  const nextPrayerLabel = next ? prayerName(next.name) : prayerName('Fajr');

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const handleShare = async () => {
    const summary = [
      'Al Iselm Nour',
      `${t('prayerTimesTitle')} - ${locationLabel}`,
      `${t('nextPrayer')}: ${nextPrayerLabel} ${next?.time ?? ''}`,
      `${t('timeRemaining')}: ${next?.timeLeft ?? ''}`,
    ].filter(Boolean).join('\n');

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Al Iselm Nour',
          text: summary,
          url: window.location.href,
        });
        showToast(t('share'));
        return;
      }

      await navigator.clipboard.writeText(`${summary}\n${window.location.href}`);
      showToast(t('shareCopied'));
    } catch {
      await navigator.clipboard?.writeText(`${summary}\n${window.location.href}`);
      showToast(t('shareCopied'));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] pb-48 lg:pb-16">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-40 top-8 size-[34rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 bottom-28 size-[30rem] rounded-full bg-[#D9B45A]/8 blur-3xl" />

      {!data && (needsLocationPermission || isError || isLocating || isFetching || locationAccessError) ? (
        <div className="relative z-10 mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8 2xl:px-0">
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
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10 2xl:px-0"
      >
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`mb-2 flex items-center gap-2 ${isRtl ? 'label-ui-ar no-arabic-uppercase text-[13px]' : 'text-xs font-semibold uppercase tracking-[0.22em]'} text-[#D9B45A]`}>
              <Sparkles className="size-4" />
              {t('dailySalat')}
            </p>
            <h1 className="text-3xl font-bold text-white lg:text-5xl">{t('prayerTimesTitle')}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#B8C4D6]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <MapPin className="size-4 text-[#10B981]" />
                {locationLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <CalendarDays className="size-4 text-[#F2C66D]" />
                {dateLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap">
            <ActionButton icon={Bell} label={t('navAdhkar')} to="/adhkar" strong />
            <ActionButton icon={Compass} label={t('qibla')} to="/qibla" />
            <ActionButton icon={Share2} label={t('share')} onClick={handleShare} />
          </div>
        </div>

        {toast ? (
          <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-2xl border border-emerald-300/25 bg-[#0F2438]/95 px-4 py-3 text-sm font-semibold text-[#A7F3D0] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            {toast}
          </div>
        ) : null}

        <div className="mb-8">
          <motion.div
            whileHover={{ y: -3 }}
            className="relative min-h-[240px] overflow-hidden rounded-[28px] border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(8,108,93,0.96),rgba(14,159,128,0.9),rgba(6,78,59,0.96))] p-7 shadow-[0_26px_80px_rgba(16,185,129,0.22)] lg:min-h-[320px] lg:p-9"
          >
            <PrayerCardDecor />
            <div className="relative z-10">
              <p className="text-sm font-semibold text-white/70">{t('nextPrayer')}</p>
              <h2 className="mt-3 font-['Cormorant_Garamond',Georgia,serif] text-6xl font-bold leading-none tracking-[-0.025em] text-white drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)] lg:text-7xl">{nextPrayerLabel}</h2>
              <p className="mt-4 text-sm text-white/70">{t('timeRemaining')}</p>
              <p className="mt-3 font-['Sora',Inter,system-ui,sans-serif] text-4xl font-extrabold tabular-nums tracking-[-0.035em] text-white lg:text-6xl">{next?.timeLeft ?? '03:40:58'}</p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl">
                <Clock3 className="size-4 text-[#F2C66D]" />
                {next?.time ? formatTime12h(next.time) : '4:34 AM'}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {prayerItems.map(({ key, icon: Icon, accent }, index) => {
            const active = next?.name === key;
            const time = timings?.[key as keyof typeof timings] ?? fallbackTimes[key];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035, duration: 0.35 }}
                whileHover={{ y: -6, scale: 1.012 }}
                className={[
                  'group relative overflow-hidden rounded-[26px] border p-6 shadow-[0_20px_55px_rgba(0,0,0,0.20)] backdrop-blur-2xl transition',
                  active
                    ? 'border-emerald-300/55 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(15,36,56,0.92))] shadow-[0_24px_70px_rgba(16,185,129,0.20)]'
                    : 'border-white/10 bg-[linear-gradient(135deg,rgba(15,36,56,0.86),rgba(10,27,46,0.76))]',
                ].join(' ')}
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition duration-700 group-hover:translate-x-[120%]" />
                <div className="relative z-10 flex items-start justify-between">
                  <span className="grid size-13 place-items-center rounded-2xl border border-white/10" style={{ color: accent, backgroundColor: `${accent}18` }}>
                    <Icon className="size-6" />
                  </span>
                  {active ? (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/12 px-3 py-1 text-xs font-bold text-[#10B981]">
                      {t('next')}
                    </span>
                  ) : null}
                </div>
                <div className="relative z-10 mt-7">
                  <p className="text-sm font-semibold text-[#B8C4D6]">{displayPrayerLabel(key, prayerName, t)}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-white">{formatTime12h(time)}</p>
                  {active ? (
                    <p className="mt-4 text-sm font-medium text-[#10B981]">{next?.timeLeft} {t('timeLeft')}</p>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
      )}
    </div>
  );
}
