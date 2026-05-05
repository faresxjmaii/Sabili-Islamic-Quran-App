import { Bookmark, ChevronLeft, Headphones, Hash, Layers, Pause, Play, RotateCcw, ScrollText } from 'lucide-react';
import { useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuranAudio } from '../app/useQuranAudio';
import AyahAudioButton from './AyahAudioButton';
import { getQuranDisplayItems } from '../services/quranDisplayService';
import { getVerseKey } from '../services/quranAudioService';
import type { QalounAyah } from '../services/quranService';
import { readingProgressService, type ReaderType } from '../services/readingProgressService';
import { useI18n } from '../i18n';

type QuranReaderProps = {
  title: string;
  subtitle: string;
  badge: string;
  verses: QalounAyah[];
  onBookmark?: (verse: QalounAyah) => void;
  readerType: ReaderType;
  readerId: number;
};

function toArabicIndicNumber(value: number): string {
  return String(value).replace(/\d/g, (digit) => String.fromCharCode(0x0660 + Number(digit)));
}

const RUB_EL_HIZB = '\u06DE';

function getCleanAyahText(text: string): string {
  return text
    .replace(/[\u06D6-\u06ED]/g, (marker) => (marker === RUB_EL_HIZB ? ` ${RUB_EL_HIZB} ` : ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function renderAyahText(text: string) {
  return text.split(RUB_EL_HIZB).map((part, index, parts) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? (
        <span className="quran-rub-el-hizb" aria-label="Rub el Hizb">
          {RUB_EL_HIZB}
        </span>
      ) : null}
    </span>
  ));
}

function ReaderStat({ icon: Icon, label }: { icon: typeof Hash; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-[#B8C4D6]">
      <Icon className="size-3.5 text-[#D9B45A]" />
      {label}
    </span>
  );
}

export default function QuranReader({ title, subtitle, badge, verses, onBookmark, readerType, readerId }: QuranReaderProps) {
  const { t, isRtl } = useI18n();
  const { audioVerses, displayItems } = useMemo(() => getQuranDisplayItems(verses), [verses]);
  const location = useLocation();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrolledRef = useRef(false);

  const firstVerse = audioVerses[0];
  const surahCount = new Set(audioVerses.map((verse) => verse.sura_no)).size;
  const {
    status,
    currentVerse,
    reciter,
    reciters,
    lastPlayed,
    errorMessage,
    setReciter,
    playQueue,
    playVerse,
    togglePlayPause,
    isCurrentVerse,
  } = useQuranAudio();

  const currentVerseInReader = Boolean(
    currentVerse && audioVerses.some((verse) => getVerseKey(verse) === getVerseKey(currentVerse))
  );
  const readerIsPlaying = currentVerseInReader && status === 'playing';
  const lastPlayedVerse = lastPlayed
    ? audioVerses.find((verse) => verse.verse_key === `${lastPlayed.surahNumber}:${lastPlayed.ayahNumber}`)
    : undefined;

  // Handle Reading Progress Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const verseKey = entry.target.getAttribute('data-verse-key');
            const ayaNo = entry.target.getAttribute('data-ayah-no');
            const suraName = entry.target.getAttribute('data-surah-name');

            if (verseKey && ayaNo) {
              readingProgressService.save({
                readerType,
                verseKey,
                ayahNumber: parseInt(ayaNo, 10),
                route: location.pathname,
                surahName: suraName || undefined,
                surahNumber: readerType === 'surah' ? readerId : undefined,
                hizbNumber: readerType === 'hizb' ? readerId : undefined,
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    // We'll attach observers to elements in the render loop via refs or data attributes
    return () => observer.disconnect();
  }, [readerType, readerId, location.pathname]);

  // Scroll to saved progress on mount
  useEffect(() => {
    if (scrolledRef.current || verses.length === 0) return;

    const saved = readingProgressService.get();
    if (saved && saved.route === location.pathname) {
      setTimeout(() => {
        const element = document.querySelector(`[data-verse-key="${saved.verseKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Softly highlight the ayah
          element.classList.add('animate-pulse-gold');
          setTimeout(() => element.classList.remove('animate-pulse-gold'), 3000);
        }
        scrolledRef.current = true;
      }, 500);
    } else {
      scrolledRef.current = true;
    }
  }, [verses, location.pathname]);

  const playLabel = readerType === 'hizb' ? t('playHizb') : t('playSurah');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] pb-64 lg:pb-32">
      <div className="absolute inset-0 bg-pattern opacity-65" />
      <div className="absolute -right-40 top-8 size-[34rem] rounded-full bg-[#10B981]/8 blur-3xl" />
      <div className="absolute -left-40 bottom-28 size-[30rem] rounded-full bg-[#D9B45A]/8 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-[1120px] px-1.5 py-4 sm:px-6 lg:px-8 lg:py-8 2xl:px-0">
        <header className="sticky top-0 z-20 -mx-1.5 mb-7 border-b border-white/10 bg-[#07111F]/88 px-4 py-4 backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:mx-auto lg:max-w-[960px] lg:rounded-[28px] lg:border lg:bg-[#0F2438]/80 lg:px-6 lg:shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/quran"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-[#DCE5EF] transition hover:bg-white/[0.07] sm:px-4"
            >
              <ChevronLeft className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
              {t('navQuran')}
            </Link>
            <span className="rounded-full border border-[#D9B45A]/25 bg-[#D9B45A]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F2C66D] sm:px-4 sm:text-xs">
              {badge}
            </span>
          </div>

          <div className="mt-5 text-center">

            <h1 className="mx-auto mt-2 max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#B8C4D6]">{subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <ReaderStat icon={Hash} label={`${audioVerses.length} ${t('ayahs')}`} />
              <ReaderStat icon={Layers} label={`${surahCount} ${surahCount > 1 ? t('surahs') : t('surah')}`} />
              {firstVerse ? <ReaderStat icon={ScrollText} label={t('startsPage', { page: firstVerse.page })} /> : null}
            </div>

            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => {
                  if (currentVerseInReader) {
                    togglePlayPause();
                    return;
                  }
                  playQueue(audioVerses, 0);
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#F2C66D]/35 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] px-5 text-sm font-bold text-[#07111F] shadow-[0_16px_36px_rgba(217,180,90,0.16)]"
                type="button"
              >
                {readerIsPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                {readerIsPlaying ? t('pauseAudio') : playLabel}
              </button>

              {lastPlayedVerse ? (
                <button
                  onClick={() => playVerse(lastPlayedVerse, audioVerses)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-5 text-sm font-bold text-[#DCE5EF] transition hover:bg-white/[0.08]"
                  type="button"
                >
                  <RotateCcw className="size-4 text-[#10B981]" />
                  {t('continueListening')}
                </button>
              ) : null}

              <label className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-[#DCE5EF]">
                <Headphones className="size-4 text-[#F2C66D]" />
                <select
                  value={reciter.id}
                  onChange={(event) => setReciter(event.target.value)}
                  className="min-w-0 bg-transparent text-sm font-semibold text-white outline-none"
                  aria-label={t('audioRecitation')}
                >
                  {reciters.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#07111F] text-white">
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {status === 'error' && errorMessage ? (
              <p className="mx-auto mt-3 max-w-xl rounded-2xl border border-[#F2C66D]/20 bg-[#D9B45A]/10 px-4 py-3 text-sm text-[#F4E7C5]">
                {t('quranAudioUnavailable')}
              </p>
            ) : null}
          </div>
        </header>

        <article className="mx-auto max-w-[920px] rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,36,56,0.76),rgba(7,17,31,0.82))] p-0.5 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:rounded-[34px] sm:p-6 lg:p-9">
          <div className="rounded-[18px] border border-white/[0.05] bg-[#07111F]/26 px-1 py-4 sm:rounded-[28px] sm:px-7 sm:py-6 md:px-8 lg:px-10 lg:py-9">
            {displayItems.map((item) => {
              if (item.type === 'basmala') {
                return (
                  <div
                    key={item.key}
                    className="mb-6 rounded-[20px] border border-[#D9B45A]/20 bg-[linear-gradient(135deg,rgba(217,180,90,0.09),rgba(16,185,129,0.06))] px-3 py-9 text-center shadow-[0_0_36px_rgba(217,180,90,0.08)] sm:mb-7 sm:rounded-[24px] sm:px-6 sm:py-11 md:py-12"
                  >
                    <p
                      className="quran-basmala-text font-quran-uthmani text-[#F4E7C5]"
                      dir="rtl"
                    >
                      {item.text}
                    </p>
                  </div>
                );
              }

              const { verse } = item;
              const cleanAyahText = getCleanAyahText(verse.aya_text);
              const verseIndex = audioVerses.findIndex(
                (audioVerse) => getVerseKey(audioVerse) === getVerseKey(verse)
              );

              return (
                <section
                  key={item.key}
                  data-verse-key={verse.verse_key}
                  data-ayah-no={verse.aya_no}
                  data-surah-name={verse.sura_name_en}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className={[
                    'group relative border-b border-white/[0.07] px-2.5 py-7 transition first:pt-1 last:border-b-0 last:pb-1 sm:rounded-[24px] sm:px-5 sm:py-10 md:px-6 lg:py-11 lg:px-7',
                    isCurrentVerse(verse)
                      ? 'rounded-[18px] border border-[#D9B45A]/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(217,180,90,0.06))] shadow-[0_0_42px_rgba(16,185,129,0.10)]'
                      : '',
                  ].join(' ')}
                >
                  <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="grid size-8 place-items-center rounded-full border border-[#D9B45A]/25 bg-[#D9B45A]/8 text-xs font-bold tabular-nums text-[#F2C66D] shadow-[0_0_24px_rgba(217,180,90,0.08)] sm:size-11 sm:text-sm">
                        {verse.aya_no}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7D8DA3] sm:text-xs sm:tracking-[0.16em]">
                        {verse.verse_key}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AyahAudioButton verse={verse} queue={audioVerses} />
                      {onBookmark ? (
                        <button
                          onClick={() => onBookmark(verse)}
                          className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#B8C4D6] transition hover:border-[#D9B45A]/35 hover:bg-[#D9B45A]/10 hover:text-[#F2C66D] sm:size-11 sm:rounded-2xl"
                          aria-label={t('manualBookmark')}
                          type="button"
                        >
                          <Bookmark className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p
                    className="quran-ayah-text font-quran-uthmani text-right text-white drop-shadow-[0_0_18px_rgba(242,198,109,0.05)]"
                    dir="rtl"
                  >
                    {renderAyahText(cleanAyahText)}
                    <span className="quran-ayah-marker" aria-label={`${t('ayah')} ${verse.aya_no}`}>
                      {toArabicIndicNumber(verse.aya_no)}
                    </span>
                  </p>

                  <div className="mt-4 flex flex-col gap-2 text-xs leading-5 text-[#6F8197] sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{verse.sura_name_en}</span>
                      <span className="size-1 rounded-full bg-[#D9B45A]/55" aria-hidden="true" />
                      <span>{t('page')} {verse.page}</span>
                      <span className="size-1 rounded-full bg-[#D9B45A]/55" aria-hidden="true" />
                      <span>{t('juz')} {verse.jozz}</span>
                    </span>
                    <span className="text-[#D9B45A]/75">
                      {t('ayah')} {verseIndex + 1} / {audioVerses.length}
                    </span>
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
