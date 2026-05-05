import { Clock3, MapPin, SunMedium } from 'lucide-react';
import { useI18n } from '../../i18n';
import MosqueSilhouette from './MosqueSilhouette';

type CompactHeroCardProps = {
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
};

export default function CompactHeroCard({
  prayerName,
  prayerTime,
  countdown,
  sunriseTime,
  hijriDate,
  locationName,
  labels,
}: CompactHeroCardProps) {
  const { isRtl } = useI18n();
  const labelClass = isRtl
    ? 'label-ui-ar no-arabic-uppercase text-[13px]'
    : 'font-[\'Inter\',sans-serif] text-[11px] font-bold uppercase tracking-[0.2em]';
  const nextPrayerLabelClass = isRtl
    ? 'label-ui-ar no-arabic-uppercase text-[13px]'
    : 'font-[\'Inter\',sans-serif] text-[11px] font-bold uppercase tracking-[0.25em] sm:text-xs';

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E9DFC9]/10 bg-[linear-gradient(135deg,#0F2438_0%,#07111F_100%)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8 lg:rounded-[32px] lg:p-10">
      <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#00A878]/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-[#D9B45A]/10 blur-3xl" />
      <MosqueSilhouette compact />

      <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex items-center gap-3">
            <span className={`${labelClass} text-[#D9B45A]`}>{labels.hijriDate}</span>
            <span className="font-['Outfit',sans-serif] text-sm font-medium tabular-nums text-[#F8FAFC]">{hijriDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`${labelClass} text-[#D9B45A]`}>{labels.sunrise}</span>
            <div className="flex items-center gap-2 text-[#F8FAFC]">
              <SunMedium className="size-4 text-[#D9B45A]" />
              <span className="font-['Outfit',sans-serif] text-sm font-medium tabular-nums">{sunriseTime ?? '--:--'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center py-5 text-center sm:py-8 lg:py-10">
          <p className={`${nextPrayerLabelClass} mb-5 text-[#00A878]`}>
            {labels.nextPrayer}
          </p>

          <div className="mb-9 flex flex-col items-center gap-2 sm:gap-3">
            <h1 className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F4E7C5_52%,#D9B45A_100%)] bg-clip-text font-['Cormorant_Garamond',Georgia,serif] text-[4.35rem] font-bold leading-none tracking-[-0.025em] text-transparent drop-shadow-[0_18px_34px_rgba(0,0,0,0.32)] sm:text-[5.55rem] lg:text-[7rem]">
              {prayerName}
            </h1>
            <p className="font-['Sora',Inter,system-ui,sans-serif] text-[3.85rem] font-extrabold leading-none tracking-[-0.045em] text-[#F8FAFC] tabular-nums drop-shadow-[0_16px_32px_rgba(217,180,90,0.12)] sm:text-[5rem] lg:text-[5.75rem]">
              {prayerTime ?? '--:--'}
            </p>
          </div>

          <div className="inline-flex items-center gap-3.5 rounded-full border border-white/5 bg-white/[0.02] px-6 py-3 shadow-sm backdrop-blur-md transition hover:bg-white/[0.04]">
            <Clock3 className="size-4 text-[#D9B45A]" />
            <span className={`${labelClass} text-[#B8C4D6]`}>{labels.timeRemaining}</span>
            <span className="font-['Outfit',sans-serif] text-base font-medium tracking-wide text-white tabular-nums sm:text-lg">{countdown}</span>
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
