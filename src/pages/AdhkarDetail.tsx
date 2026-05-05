import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, ChevronLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdhkarByCategory } from '../data/adhkar';
import type { DhikrCategory } from '../data/adhkar';
import { useI18n, type TranslationKey } from '../i18n';

const titleKeys: Record<DhikrCategory, TranslationKey> = {
  morning: 'morningAdhkar',
  evening: 'eveningAdhkar',
  'after-prayer': 'afterPrayerAdhkar',
};

const subtitleKeys: Record<DhikrCategory, TranslationKey> = {
  morning: 'morningAdhkarSubtitle',
  evening: 'eveningAdhkarSubtitle',
  'after-prayer': 'afterPrayerAdhkarSubtitle',
};

function readSavedCounts(category?: DhikrCategory): Record<string, number> {
  if (!category) return {};

  const today = new Date().toDateString();
  const saved = localStorage.getItem(`adhkar-progress-${category}-${today}`);
  return saved ? (JSON.parse(saved) as Record<string, number>) : {};
}

export default function AdhkarDetail() {
  const { category } = useParams<{ category: DhikrCategory }>();
  const { t, language, isRtl } = useI18n();
  const activeCategory = category as DhikrCategory;
  const adhkarList = useMemo(() => getAdhkarByCategory(activeCategory), [activeCategory]);

  const [counts, setCounts] = useState<Record<string, number>>(() => readSavedCounts(activeCategory));

  const saveProgress = (newCounts: Record<string, number>) => {
    const today = new Date().toDateString();
    localStorage.setItem(`adhkar-progress-${activeCategory}-${today}`, JSON.stringify(newCounts));
  };

  const handleIncrement = (id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= max) return prev;
      const updated = { ...prev, [id]: current + 1 };
      saveProgress(updated);
      return updated;
    });
  };

  const handleReset = (id: string) => {
    setCounts((prev) => {
      const updated = { ...prev, [id]: 0 };
      saveProgress(updated);
      return updated;
    });
  };

  if (!activeCategory || adhkarList.length === 0) {
    return <div className="p-8 text-center text-white">{t('categoryMissing')}</div>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-4 lg:px-8">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/adhkar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          aria-label={t('navAdhkar')}
        >
          <ChevronLeft className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{t(titleKeys[activeCategory])}</h1>
          <p className="text-sm text-[#B8C4D6]">{t(subtitleKeys[activeCategory])}</p>
        </div>
      </div>

      <div className="space-y-4">
        {adhkarList.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.repeats;
          const repeatLabel = item.repeats === 1 ? t('repeat') : t('repeats');

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
              className={`relative overflow-hidden rounded-[22px] p-4 transition-all duration-300 sm:p-5 ${
                isDone ? 'border-[#00A878]/30 shadow-[0_0_30px_rgba(0,168,120,0.1)]' : 'border-white/10 shadow-lg'
              }`}
              style={{
                background: isDone ? 'rgba(0, 168, 120, 0.05)' : 'rgba(15, 36, 56, 0.85)',
                borderWidth: '1px',
                borderStyle: 'solid',
                backdropFilter: 'blur(16px)',
              }}
            >
              {isDone ? (
                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00A878]/10 blur-3xl" />
              ) : null}

              <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#00A878]">
                    {index + 1} / {adhkarList.length}
                  </span>
                  {item.title ? <h2 className="mt-1 truncate text-sm font-semibold text-white">{item.title}</h2> : null}
                </div>
                <span className="shrink-0 rounded-full border border-[#D9B45A]/20 bg-[#D9B45A]/10 px-2.5 py-1 text-xs font-semibold text-[#F2C66D]">
                  {item.repeats} {repeatLabel}
                </span>
              </div>

              <p className="relative z-10 mb-4 text-right font-arabic text-[1.28rem] leading-[2.05] text-[#F4E7C5] sm:text-2xl" dir="rtl">
                {item.arabic}
              </p>

              <div className="relative z-10 mb-4 flex flex-wrap items-center gap-2 text-xs text-[#6B7F96]">
                {item.reference ? (
                  <span className="rounded-md bg-white/5 px-2 py-1">
                    {t('source')}: <span className="text-[#B8C4D6]">{item.reference}</span>
                  </span>
                ) : null}
                {language !== 'ar' ? <span className="leading-5 text-[#B8C4D6]">{item.translation}</span> : null}
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReset(item.id)}
                    className="grid h-9 w-9 place-items-center rounded-xl text-[#6B7F96] transition hover:bg-white/5 hover:text-white"
                    title={t('reset')}
                    type="button"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <span className="font-medium tabular-nums text-white">
                    {currentCount} <span className="text-[#6B7F96]">/ {item.repeats}</span>
                  </span>
                </div>

                <button
                  onClick={() => handleIncrement(item.id, item.repeats)}
                  disabled={isDone}
                  className={`relative flex h-10 min-w-24 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${
                    isDone
                      ? 'border border-[#00A878]/30 bg-[#00A878]/20 text-[#00A878]'
                      : 'bg-gradient-to-r from-[#00A878] to-[#047857] text-white shadow-[0_8px_24px_rgba(0,168,120,0.28)] hover:scale-105 active:scale-95'
                  }`}
                  type="button"
                >
                  {isDone ? (
                    <span className="flex items-center gap-2">
                      <Check size={17} />
                      {t('done')}
                    </span>
                  ) : (
                    t('counter')
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
