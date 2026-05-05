import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Map } from 'lucide-react';
import { getAdhkarByCategory } from '../data/adhkar';
import type { DhikrCategory } from '../data/adhkar';
import { useI18n } from '../i18n';

interface CategoryProgress {
  total: number;
  completed: number;
}

const CATEGORIES = [
  {
    id: 'morning' as DhikrCategory,
    titleEn: 'Morning Adhkar',
    titleAr: 'أذكار الصباح',
    subtitleFr: "De Fajr jusqu'au lever du soleil",
    icon: Sun,
    buttonText: 'Commencer',
  },
  {
    id: 'evening' as DhikrCategory,
    titleEn: 'Evening Adhkar',
    titleAr: 'أذكار المساء',
    subtitleFr: "De Maghrib jusqu'à l'aube",
    icon: Moon,
    buttonText: 'Commencer',
  },
  {
    id: 'after-prayer' as DhikrCategory,
    titleEn: 'After Prayer Adhkar',
    titleAr: 'أذكار بعد الصلاة',
    subtitleFr: 'Après les prières obligatoires',
    icon: Map,
    buttonText: 'Voir tout',
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
  const { t, language } = useI18n();
  const progress = useMemo(() => getCategoryProgress(), []);

  return (
    <div className="min-h-screen pt-6 pb-28 px-4 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">{t('navAdhkar')}</h1>
        <p className="text-[#B8C4D6]">{t('adhkarSubtitle')}</p>
      </div>

      <div className="space-y-6">
        {CATEGORIES.map((cat, index) => {
          const catProgress = progress[cat.id];
          const isAllDone = catProgress.total > 0 && catProgress.completed === catProgress.total;
          const progressPercentage = catProgress.total > 0 ? (catProgress.completed / catProgress.total) * 100 : 0;
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link 
                to={`/adhkar/${cat.id}`}
                className="block relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(15, 36, 56, 0.85)',
                  border: '1px solid rgba(0, 168, 120, 0.3)',
                  boxShadow: '0 4px 30px rgba(0, 168, 120, 0.05), inset 0 0 20px rgba(0, 168, 120, 0.02)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A878]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border border-[#00A878]/20 bg-gradient-to-br from-[#00A878]/10 to-[#047857]/5">
                    <cat.icon className="w-7 h-7 text-[#00A878]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="text-xl font-bold text-white tracking-tight truncate">
                        {language === 'it' && cat.id === 'morning' ? 'Adhkar del mattino' : language === 'it' && cat.id === 'evening' ? 'Adhkar della sera' : language === 'it' ? 'Adhkar dopo la preghiera' : cat.titleEn}
                      </h2>
                      <span className="text-xl text-[#F2C66D] font-arabic" dir="rtl">{cat.titleAr}</span>
                    </div>
                    <p className="text-sm text-[#B8C4D6]">{cat.subtitleFr}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/10" />
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="transparent" 
                          strokeDasharray="125.6" 
                          strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100}
                          className="text-[#00A878] transition-all duration-1000 ease-out" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                        {catProgress.completed}/{catProgress.total}
                      </div>
                    </div>
                    <span className="text-sm text-[#B8C4D6]">{t('completed')}</span>
                  </div>

                  <div 
                    className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      isAllDone 
                        ? 'bg-[#00A878]/10 text-[#00A878] border border-[#00A878]/20'
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
