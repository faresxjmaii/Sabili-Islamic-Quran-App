import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdhkarByCategory } from '../data/adhkar';
import type { DhikrCategory } from '../data/adhkar';
import { useI18n } from '../i18n';

function readSavedCounts(category?: DhikrCategory): Record<string, number> {
  if (!category) return {};

  const today = new Date().toDateString();
  const saved = localStorage.getItem(`adhkar-progress-${category}-${today}`);
  return saved ? (JSON.parse(saved) as Record<string, number>) : {};
}

export default function AdhkarDetail() {
  const { category } = useParams<{ category: DhikrCategory }>();
  const { t } = useI18n();
  const adhkarList = getAdhkarByCategory(category as DhikrCategory);
  
  const [counts, setCounts] = useState<Record<string, number>>(() => readSavedCounts(category as DhikrCategory));

  const saveProgress = (newCounts: Record<string, number>) => {
    const today = new Date().toDateString();
    localStorage.setItem(`adhkar-progress-${category}-${today}`, JSON.stringify(newCounts));
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

  if (adhkarList.length === 0) {
    return <div className="p-8 text-center text-white">{t('categoryMissing')}</div>;
  }

  const titleMap: Record<DhikrCategory, { ar: string, fr: string }> = {
    'morning': { ar: 'أذكار الصباح', fr: 'Adhkar du Matin' },
    'evening': { ar: 'أذكار المساء', fr: 'Adhkar du Soir' },
    'after-prayer': { ar: 'أذكار بعد الصلاة', fr: 'Adhkar Après la Prière' }
  };

  return (
    <div className="min-h-screen pt-4 pb-28 px-4 lg:px-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/adhkar" 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-arabic" dir="rtl">{titleMap[category as DhikrCategory].ar}</h1>
          <p className="text-[#B8C4D6] text-sm">{titleMap[category as DhikrCategory].fr}</p>
        </div>
      </div>

      <div className="space-y-6">
        {adhkarList.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.repeats;

          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${isDone ? 'border-[#00A878]/30 shadow-[0_0_30px_rgba(0,168,120,0.1)]' : 'border-white/10 shadow-lg'}`}
              style={{
                background: isDone ? 'rgba(0, 168, 120, 0.05)' : 'rgba(15, 36, 56, 0.85)',
                borderWidth: '1px',
                borderStyle: 'solid',
                backdropFilter: 'blur(16px)',
              }}
            >
              {isDone && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A878]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                <span className="text-[#00A878] text-sm font-semibold">{index + 1} / {adhkarList.length}</span>
                {item.reference && (
                  <span className="text-[#6B7F96] text-xs px-2 py-1 rounded-md bg-white/5">{item.reference}</span>
                )}
              </div>

              <p className="font-arabic text-3xl leading-loose text-[#F2C66D] text-right mb-6" dir="rtl">
                {item.arabic}
              </p>

              <p className="text-[#B8C4D6] text-sm leading-relaxed mb-8">
                {item.translation}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => handleReset(item.id)}
                    className="p-2 text-[#6B7F96] hover:text-white transition"
                    title={t('reset')}
                   >
                     <RotateCcw size={16} />
                   </button>
                   <span className="text-white font-medium tabular-nums">
                     {currentCount} <span className="text-[#6B7F96]">/ {item.repeats}</span>
                   </span>
                </div>
                
                <button
                  onClick={() => handleIncrement(item.id, item.repeats)}
                  disabled={isDone}
                  className={`relative flex items-center justify-center w-32 h-12 rounded-xl font-bold transition-all ${
                    isDone 
                      ? 'bg-[#00A878]/20 text-[#00A878] border border-[#00A878]/30' 
                      : 'bg-gradient-to-r from-[#00A878] to-[#047857] text-white shadow-[0_8px_24px_rgba(0,168,120,0.35)] hover:scale-105 active:scale-95'
                  }`}
                >
                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <Check size={18} />
                      <span>{t('done')}</span>
                    </div>
                  ) : (
                    <span>{t('counter')}</span>
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
