import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Moon, Sun } from 'lucide-react';
import { getAdhkarByCategory } from '../data/adhkar';
import type { DhikrCategory } from '../data/adhkar';
import { useI18n, type TranslationKey } from '../i18n';

interface CategoryProgress {
  total: number;
  completed: number;
}

const CATEGORIES = [
  {
    id: 'morning' as DhikrCategory,
    titleKey: 'morningAdhkar' as TranslationKey,
    subtitleKey: 'morningAdhkarSubtitle' as TranslationKey,
    icon: Sun,
  },
  {
    id: 'evening' as DhikrCategory,
    titleKey: 'eveningAdhkar' as TranslationKey,
    subtitleKey: 'eveningAdhkarSubtitle' as TranslationKey,
    icon: Moon,
  },
  {
    id: 'after-prayer' as DhikrCategory,
    titleKey: 'afterPrayerAdhkar' as TranslationKey,
    subtitleKey: 'afterPrayerAdhkarSubtitle' as TranslationKey,
    icon: Map,
  },
];

function getCategoryProgress(): Record<DhikrCategory, CategoryProgress> {
  const today = new Date().toDateString();

  return CATEGORIES.reduce((result, category) => {
    const items = getAdhkarByCategory(category.id);
    const saved = localStorage.getItem(`adhkar-progress-${category.id}-${today}`);
    const counts = saved ? (JSON.parse(saved) as Record<string, number>) : {};
    const completed = items.filter((item) => (counts[item.id] || 0) >= item.repeats).length;

    return {
      ...result,
      [category.id]: {
        total: items.length,
        completed,
      },
    };
  }, {} as Record<DhikrCategory, CategoryProgress>);
}

export default function AdhkarPage() {
  const { t } = useI18n();
  const progress = useMemo(() => getCategoryProgress(), []);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-5 lg:px-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-white">{t('navAdhkar')}</h1>
        <p className="text-[#B8C4D6]">{t('adhkarSubtitle')}</p>
      </div>

      <div className="space-y-3.5">
        {CATEGORIES.map((cat, index) => {
          const catProgress = progress[cat.id];
          const isAllDone = catProgress.total > 0 && catProgress.completed === catProgress.total;
          const progressPercentage = catProgress.total > 0 ? (catProgress.completed / catProgress.total) * 100 : 0;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
            >
              <Link
                to={`/adhkar/${cat.id}`}
                className="relative block overflow-hidden rounded-[20px] p-4 transition-all duration-300 hover:scale-[1.01] sm:p-5"
                style={{
                  background: 'rgba(15, 36, 56, 0.85)',
                  border: '1px solid rgba(0, 168, 120, 0.3)',
                  boxShadow: '0 4px 30px rgba(0, 168, 120, 0.05), inset 0 0 20px rgba(0, 168, 120, 0.02)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00A878]/10 blur-3xl" />

                <div className="relative z-10 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00A878]/20 bg-gradient-to-br from-[#00A878]/12 to-[#047857]/5">
                    <cat.icon className="h-5 w-5 text-[#00A878]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                        {t(cat.titleKey)}
                      </h2>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-[#F2C66D]">
                        {catProgress.total} {t('items')}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-[#B8C4D6] sm:text-sm">{t(cat.subtitleKey)}</p>
                  </div>
                </div>

                <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#B8C4D6]">
                      <span>{t('completed')}</span>
                      <span className="font-semibold tabular-nums text-white">
                        {catProgress.completed}/{catProgress.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#00A878] transition-all duration-700"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                      isAllDone
                        ? 'border border-[#00A878]/20 bg-[#00A878]/10 text-[#00A878]'
                        : 'bg-[#00A878] text-white shadow-[0_4px_14px_rgba(0,168,120,0.4)]'
                    }`}
                  >
                    {isAllDone ? t('done') : cat.id === 'after-prayer' ? t('viewAll') : t('start')}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
