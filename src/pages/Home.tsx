import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Compass,
  MapPin,
  Settings,
  SunMedium,
  Wind,
} from 'lucide-react';
import { useNextPrayer } from '../hooks/useNextPrayer';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import LocationPermissionCard from '../components/LocationPermissionCard';
import BrandLogo from '../components/BrandLogo';
import LanguageSelector from '../components/LanguageSelector';
import { useI18n, type TranslationKey } from '../i18n';

type PrayerRow = {
  name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
};

const fallbackPrayers: PrayerRow[] = [
  { name: 'Fajr', time: '04:28' },
  { name: 'Sunrise', time: '06:10' },
  { name: 'Dhuhr', time: '13:15' },
  { name: 'Asr', time: '16:46' },
  { name: 'Maghrib', time: '20:29' },
  { name: 'Isha', time: '21:59' },
];





const countryFr: Record<string, string> = {
  France: 'France',
  Italy: 'Italie',
  Tunisia: 'Tunisie',
  Algeria: 'Algérie',
  Morocco: 'Maroc',
  Germany: 'Allemagne',
  Spain: 'Espagne',
  'United States': 'États-Unis',
  'United Kingdom': 'Royaume-Uni',
};





function formatLocationFrench(city?: string, country?: string, displayName?: string) {
  if (city || country) {
    return [city, country ? countryFr[country] ?? country : undefined].filter(Boolean).join(', ');
  }
  return displayName ?? 'Localisation';
}



const quickActions: Array<{
  to: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: LucideIcon;
  accent: string;
  surface: string;
}> = [
  { to: '/quran', titleKey: 'navQuran', subtitleKey: 'quranReflect', icon: BookOpen, accent: '#F2C66D', surface: 'rgba(16,185,129,0.14)' },
  { to: '/adhkar', titleKey: 'navAdhkar', subtitleKey: 'adhkarRemember', icon: Wind, accent: '#F2C66D', surface: 'rgba(217,180,90,0.14)' },
  { to: '/qibla', titleKey: 'qibla', subtitleKey: 'qiblaDirection', icon: Compass, accent: '#E7F7F0', surface: 'rgba(16,185,129,0.10)' },
  { to: '/settings', titleKey: 'navSettings', subtitleKey: 'settingsPrefs', icon: Settings, accent: '#EAF1FF', surface: 'rgba(80,130,190,0.16)' },
];

function MosqueSilhouette({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? 'absolute inset-x-0 bottom-0 h-24 w-full text-[#D9B45A]/10' : 'absolute inset-x-0 bottom-0 h-28 w-full text-[#D9B45A]/10'}
      viewBox="0 0 900 190"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 190V110h48V74h18v36h36V86c0-27 27-51 55-51s55 24 55 51v24h38V60h18v50h40v80H0Zm348 0V94h44V58h18v36h40v-5c0-35 38-68 76-68s76 33 76 68v5h42V54h18v40h44v96H348Zm440 0v-72h30V84h16v34h32v-4c0-26 28-50 57-50s57 24 57 50v4h32V88h16v30h28v72H788Z"
      />
    </svg>
  );
}

function MobileTopBar() {
  return (
    <div className="mb-5 flex items-center justify-between px-0.5 pt-3 lg:hidden">
      <BrandLogo compact />
      <LanguageSelector compact />
    </div>
  );
}



function CompactHeroCard({
  prayerName,
  prayerTime,
  countdown,
  sunriseTime,
  hijriDate,
  locationName,
  labels,
}: {
  prayerName: string;
  prayerTime?: string;
  countdown: string;
  sunriseTime?: string;
  hijriDate: string;
  locationName: string;
  labels: {
    hijriDate: string;
    sunrise: string;
    nextPrayer: string;
    timeRemaining: string;
  };
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] lg:rounded-[32px] border border-[#E9DFC9]/10 bg-[linear-gradient(135deg,#0F2438_0%,#07111F_100%)] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00A878]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D9B45A]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      <MosqueSilhouette compact />

      <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <span className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B45A]">{labels.hijriDate}</span>
            <span className="font-['Inter',sans-serif] text-sm font-medium text-[#F8FAFC]">{hijriDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-[0.2em] text-[#D9B45A]">{labels.sunrise}</span>
            <div className="flex items-center gap-2 text-[#F8FAFC]">
              <SunMedium className="size-4 text-[#D9B45A]" />
              <span className="font-['Outfit',sans-serif] text-sm font-medium tabular-nums">{sunriseTime ?? '--:--'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center py-5 sm:py-8 lg:py-10">
          <p className="font-['Inter',sans-serif] text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#00A878] mb-5">
            {labels.nextPrayer}
          </p>
          
          <div className="flex flex-col items-center gap-2 sm:gap-3 mb-9">
            <h1 className="font-['Cormorant_Garamond',Georgia,serif] text-[4.35rem] font-bold leading-none tracking-[-0.025em] text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#F4E7C5_52%,#D9B45A_100%)] drop-shadow-[0_18px_34px_rgba(0,0,0,0.32)] sm:text-[5.55rem] lg:text-[7rem]">
              {prayerName}
            </h1>
            <p className="font-['Sora',Inter,system-ui,sans-serif] text-[3.85rem] font-extrabold leading-none tracking-[-0.045em] text-[#F8FAFC] tabular-nums drop-shadow-[0_16px_32px_rgba(217,180,90,0.12)] sm:text-[5rem] lg:text-[5.75rem]">
              {prayerTime ?? '--:--'}
            </p>
          </div>

          <div className="inline-flex items-center gap-3.5 rounded-full border border-white/5 bg-white/[0.02] px-6 py-3 backdrop-blur-md shadow-sm transition hover:bg-white/[0.04]">
            <Clock3 className="size-4 text-[#D9B45A]" />
            <span className="font-['Inter',sans-serif] text-[11px] font-bold uppercase tracking-[0.2em] text-[#B8C4D6]">{labels.timeRemaining}</span>
            <span className="font-['Outfit',sans-serif] text-base sm:text-lg font-medium text-white tabular-nums tracking-wide">{countdown}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1 text-[#B8C4D6]">
          <MapPin className="size-4" />
          <span className="font-['Inter',sans-serif] text-sm font-medium tracking-wide">{locationName}</span>
        </div>
      </div>
    </section>
  );
}



function PrayerTimesCard({ prayers, active }: { prayers: PrayerRow[]; active: string }) {
  const { t, prayerName } = useI18n();

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#0F2438]/82 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-8 lg:h-[445px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{t('todaysPrayerTimes')}</h3>
        <Link to="/prayer" className="inline-flex items-center gap-1 text-xs font-bold text-[#F2C66D]">
          {t('viewCalendar')}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {prayers.map((prayer) => {
          const isActive = prayer.name === active;
          return (
            <div
              key={prayer.name}
              className={[
                'flex items-center justify-between rounded-xl border px-4 py-3 transition',
                isActive ? 'border-emerald-300/30 bg-[linear-gradient(90deg,rgba(16,185,129,0.25),rgba(16,185,129,0.08))]' : 'border-white/[0.04] bg-white/[0.018]',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'size-2.5 rounded-full bg-[#D9B45A] shadow-[0_0_18px_rgba(217,180,90,0.7)]' : 'size-2 rounded-full bg-[#D9B45A]/70'} />
                <span className={isActive ? 'font-semibold text-white' : 'font-medium text-[#F8FAFC]'}>{prayerName(prayer.name)}</span>
              </div>
              <span className="font-semibold tabular-nums text-white">{prayer.time}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyAyahCard() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0F2438]/82 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:h-[300px]">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#F2C66D]">“</span>
            <h3 className="text-lg font-semibold text-white">{t('dailyAyah')}</h3>
          </div>
          <Link to="/quran" className="text-xs font-semibold text-[#F2C66D]">{t('viewInQuran')}</Link>
        </div>
        <p className="font-arabic text-right text-xl leading-[1.9] text-white drop-shadow-[0_0_22px_rgba(242,198,109,0.18)]" dir="rtl">
          وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ
        </p>
        <p className="mt-3 text-sm leading-6 text-[#DCE5EF]">
          Do not lose hope, nor be sad. You will be superior if you are true believers.
        </p>
        <p className="mt-3 text-sm font-medium text-[#D9B45A]">Aal-Imran (3:139)</p>
      </div>
    </section>
  );
}

function QuickActionsCard() {
  const { t } = useI18n();

  return (
    <section className="rounded-[24px] border border-white/10 bg-[#0F2438]/82 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl lg:h-[300px]">
      <h3 className="mb-5 text-lg font-semibold text-white">{t('quickActions')}</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {quickActions.map(({ to, titleKey, subtitleKey, icon: Icon, accent, surface }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-[16px] border border-white/[0.08] p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-white/15 lg:min-h-[166px]"
            style={{ background: surface }}
          >
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl border border-white/12" style={{ color: accent }}>
              <Icon className="size-7" />
            </span>
            <p className="text-sm font-semibold text-white">{t(titleKey)}</p>
            <p className="mt-1 text-[11px] leading-4 text-[#DCE5EF]">{t(subtitleKey)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const {
    data,
    isError,
    error,
    needsLocationPermission,
    requestLocation,
  } = usePrayerTimes();
  const timings = data?.data.timings;
  const nextPrayer = useNextPrayer(timings);
  const { t, prayerName } = useI18n();
  const prayers = fallbackPrayers.map((prayer) => ({
    ...prayer,
    time: timings?.[prayer.name] ?? prayer.time,
  }));
  const activePrayer = nextPrayer?.name ?? 'Fajr';
  const countdown = nextPrayer?.timeLeft ?? '00:00:00';


  const locationFrench = formatLocationFrench(
    data?.resolvedLocation?.city,
    data?.resolvedLocation?.country,
    data?.resolvedLocation?.displayName
  ) || t('location');
  const hijriDate = data?.data.date.hijri
    ? `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`
    : 'Hijri date';

  return (
    <div className="relative overflow-hidden bg-[#07111F] pb-28 lg:pb-12">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-40 top-8 size-[30rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 top-1/3 size-[28rem] rounded-full bg-[#D9B45A]/7 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-0">
        <MobileTopBar />

        {needsLocationPermission || isError ? (
          <div className="py-10">
            <LocationPermissionCard
              onEnable={requestLocation}
              errorMessage={isError ? String(error) : undefined}
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
              locationName={locationFrench}
              labels={{
                hijriDate: t('hijriDate'),
                sunrise: t('sunrise'),
                nextPrayer: t('nextPrayer'),
                timeRemaining: t('timeRemaining'),
              }}
            />

            <div className="grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5">
                <PrayerTimesCard prayers={prayers} active={activePrayer} />
              </div>
              <div className="lg:col-span-7 flex flex-col gap-8">
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
