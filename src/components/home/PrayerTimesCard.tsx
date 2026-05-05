import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { PrayerRow } from './homeTypes';

export default function PrayerTimesCard({ prayers, active }: { prayers: PrayerRow[]; active: string }) {
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
