import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, BookOpen, ChevronRight, Search, Settings, SlidersHorizontal, Sparkles } from 'lucide-react';
import { bookmarkService, fetchChapters, getHizbSummaries } from '../services/quranService';
import { readingProgressService } from '../services/readingProgressService';
import { useI18n, type TranslationKey } from '../i18n';

type QuranTab = 'all' | 'makkah' | 'madinah' | 'hizb';

const tabs: Array<{ id: QuranTab; labelKey: TranslationKey }> = [
  { id: 'all', labelKey: 'allSurahs' },
  { id: 'makkah', labelKey: 'meccan' },
  { id: 'madinah', labelKey: 'medinan' },
  { id: 'hizb', labelKey: 'hizb60' },
];

export default function QuranPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<QuranTab>('all');
  const { t } = useI18n();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chapters'],
    queryFn: () => fetchChapters('en'),
    staleTime: 60 * 60 * 1000,
  });

  const surahs = useMemo(() => {
    const chapters = data?.chapters ?? [];
    return chapters.filter((chapter) => {
      const matchesQuery = `${chapter.name_simple} ${chapter.name_arabic} ${chapter.translated_name.name}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab =
        activeTab === 'all' ||
        activeTab === 'hizb' ||
        (activeTab === 'makkah' && chapter.revelation_place === 'makkah') ||
        (activeTab === 'madinah' && chapter.revelation_place === 'madinah');

      return matchesQuery && matchesTab;
    });
  }, [activeTab, data?.chapters, query]);

  const hizbs = useMemo(() => getHizbSummaries(), []);
  const filteredHizbs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return hizbs;

    return hizbs.filter((hizb) =>
      `${hizb.id} ${hizb.title} ${hizb.subtitle}`.toLowerCase().includes(normalized)
    );
  }, [hizbs, query]);
  const bookmark = useMemo(() => bookmarkService.get(), []);
  const readingProgress = useMemo(() => readingProgressService.get(), []);

  const lastReadTitle = readingProgress 
    ? `${readingProgress.surahName || (readingProgress.readerType === 'hizb' ? `Hizb ${readingProgress.hizbNumber}` : 'Quran')} - Ayah ${readingProgress.ayahNumber}`
    : bookmark 
      ? `${bookmark.surahName} - Ayah ${bookmark.verseNumber}` 
      : 'Al-Baqarah - Ayah 255';

  if (isError) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-10 text-red-300">
        {String(error)}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] pb-36 lg:pb-16">
      <div className="absolute inset-0 bg-pattern opacity-70" />
      <div className="absolute -right-32 top-12 size-[32rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-32 bottom-20 size-[28rem] rounded-full bg-[#D9B45A]/8 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-8 lg:px-8 lg:py-10 2xl:px-0">
        <section className="mx-auto w-full max-w-[620px] lg:max-w-none">
          <header className="mb-5 flex items-center justify-between lg:mb-6">
            <div>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-[#D9B45A] lg:block">{t('riwayatQaloun')}</p>
              <h1 className="text-2xl font-semibold text-white lg:mt-2 lg:text-4xl">{t('navQuran')}</h1>
            </div>
            <button className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#B8C4D6] lg:size-12" type="button" aria-label="Quran settings">
              <Settings className="size-5" />
            </button>
          </header>

          <div className="mb-4 flex gap-3">
            <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#0F2438]/90 px-4 text-[#7D8DA3] shadow-[0_18px_50px_rgba(0,0,0,0.18)] lg:h-14">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7D8DA3]"
                placeholder={activeTab === 'hizb' ? t('searchHizb') : t('searchSurah')}
              />
            </label>
            <button className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-[#0F2438]/90 text-[#B8C4D6] lg:size-14" type="button" aria-label="Filter Quran">
              <SlidersHorizontal className="size-5" />
            </button>
          </div>

          {readingProgress ? (
            <Link
              to={readingProgress.route}
              className="mb-6 flex items-center gap-4 rounded-[22px] border border-[#D9B45A]/20 bg-[linear-gradient(135deg,rgba(15,36,56,0.9),rgba(7,17,31,0.85))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition hover:border-[#D9B45A]/40 lg:p-5"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[#D9B45A]/20 bg-[linear-gradient(135deg,rgba(242,198,109,0.20),rgba(16,185,129,0.10))] text-[#F2C66D] lg:size-20">
                <BookOpen className="size-9 lg:size-11" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#D9B45A]">Continue Reading</span>
                <span className="mt-1 block text-sm font-semibold text-white lg:text-base">{lastReadTitle}</span>
                <span className="mt-1 block text-xs text-[#B8C4D6]">Resuming from your last session</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-[#D9B45A]" />
            </Link>
          ) : bookmark ? (
            <Link
              to={`/quran/${bookmark.surahId}`}
              className="mb-6 flex items-center gap-4 rounded-[22px] border border-white/10 bg-[#0F2438]/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition hover:border-[#D9B45A]/30 lg:p-5"
            >
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-[#D9B45A]/20 bg-[linear-gradient(135deg,rgba(242,198,109,0.20),rgba(16,185,129,0.10))] text-[#F2C66D] lg:size-20">
                <Bookmark className="size-9 lg:size-11" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#D9B45A]">{t('lastRead')}</span>
                <span className="mt-1 block text-sm font-semibold text-white lg:text-base">{lastReadTitle}</span>
                <span className="mt-1 block text-xs text-[#B8C4D6]">Manual bookmark</span>
              </span>
              <Bookmark className="size-5 shrink-0 fill-[#F2C66D] text-[#F2C66D]" />
            </Link>
          ) : null}

          <div className="mb-4 flex items-center gap-2 overflow-x-auto border-b border-white/10 px-1 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'relative shrink-0 pb-3 font-semibold text-[#F2C66D]' : 'shrink-0 pb-3 font-medium text-[#7D8DA3]'}
                type="button"
              >
                {t(tab.labelKey)}
                {activeTab === tab.id ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-[#D9B45A]" /> : null}
              </button>
            ))}
          </div>

          {activeTab === 'hizb' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredHizbs.map((hizb) => (
                <Link
                  key={hizb.id}
                  to={`/quran/hizb/${hizb.id}`}
                  className="group rounded-[22px] border border-white/10 bg-[#0F2438]/74 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-[#D9B45A]/28 hover:bg-white/[0.045]"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D9B45A]">{t('hizb')}</span>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-white">{hizb.title}</p>
                      <p className="mt-1 text-xs text-[#B8C4D6]">{hizb.subtitle}</p>
                    </div>
                    <ChevronRight className="size-4 text-[#7D8DA3] transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0A1B2E]/62 shadow-[0_22px_60px_rgba(0,0,0,0.20)]">
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 border-b border-white/[0.06] p-4 last:border-b-0">
                      <span className="size-8 animate-pulse rounded-xl bg-white/10" />
                      <span className="flex-1 space-y-2">
                        <span className="block h-4 w-36 animate-pulse rounded bg-white/10" />
                        <span className="block h-3 w-20 animate-pulse rounded bg-white/10" />
                      </span>
                      <span className="h-5 w-16 animate-pulse rounded bg-white/10" />
                    </div>
                  ))
                : surahs.map((surah) => (
                    <Link
                      key={surah.id}
                      to={`/quran/${surah.id}`}
                      className="group flex items-center gap-4 border-b border-white/[0.06] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.04] lg:px-5"
                    >
                      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold text-[#DCE5EF]">
                        {surah.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={surah.id === 2 ? 'block text-base font-semibold text-[#D9B45A]' : 'block text-base font-semibold text-white'}>
                          {surah.name_simple}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-[#7D8DA3]">
                          {surah.verses_count} Ayahs - {surah.revelation_place === 'makkah' ? t('meccan') : t('medinan')}
                        </span>
                      </span>
                      <span className="font-arabic text-xl text-[#DCE5EF] lg:text-2xl" dir="rtl">{surah.name_arabic}</span>
                      <ChevronRight className="hidden size-4 text-[#7D8DA3] transition group-hover:translate-x-1 lg:block" />
                    </Link>
                  ))}
            </div>
          )}
        </section>

        <aside className="mt-8 hidden lg:block">
          <div className="sticky top-8 rounded-[28px] border border-white/10 bg-[#0F2438]/76 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9B45A]">{t('defaultReading')}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{t('riwayatQaloun')}</h2>
                <p className="mt-1 text-sm text-[#B8C4D6]">{t('qalounDesc')}</p>
              </div>
              <Sparkles className="size-6 text-[#10B981]" />
            </div>
            <p className="font-qaloun text-right text-3xl leading-[2.35] text-white" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="mt-7 rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm leading-6 text-[#DCE5EF]">
                {t('quranDesc')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
