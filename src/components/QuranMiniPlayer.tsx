import { AlertCircle, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useQuranAudio } from '../app/useQuranAudio';

export default function QuranMiniPlayer() {
  const {
    status,
    currentVerse,
    currentIndex,
    queueLength,
    reciter,
    errorMessage,
    togglePlayPause,
    playNext,
    playPrevious,
    closePlayer,
  } = useQuranAudio();

  if (!currentVerse) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div className="fixed inset-x-0 bottom-[calc(6.35rem+env(safe-area-inset-bottom))] z-[60] px-3 lg:bottom-5 lg:px-6">
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[24px] border border-white/10 bg-[#07111F]/92 px-3 py-3 shadow-[0_-18px_70px_rgba(0,0,0,0.45),0_0_40px_rgba(16,185,129,0.10)] backdrop-blur-2xl sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#D9B45A]/25 bg-[#D9B45A]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F2C66D]">
              Audio recitation
            </span>
            {status === 'error' ? <AlertCircle className="size-4 text-[#F2C66D]" /> : null}
          </div>
          <p className="mt-1 truncate text-sm font-bold text-white">
            {currentVerse.sura_name_en} · Ayah {currentVerse.aya_no}
          </p>
          <p className="truncate text-xs text-[#B8C4D6]">
            {status === 'error' ? errorMessage : `${reciter.name}${queueLength > 1 ? ` · ${currentIndex + 1}/${queueLength}` : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={playPrevious}
            disabled={currentIndex <= 0}
            className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#DCE5EF] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
            type="button"
            aria-label="Previous ayah"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={togglePlayPause}
            className="grid size-11 place-items-center rounded-2xl border border-[#F2C66D]/35 bg-[linear-gradient(135deg,#F2C66D,#D9B45A)] text-[#07111F] shadow-[0_14px_36px_rgba(217,180,90,0.18)]"
            type="button"
            aria-label={isPlaying ? 'Pause Quran audio' : 'Play Quran audio'}
          >
            {isPlaying || isLoading ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
          <button
            onClick={playNext}
            disabled={currentIndex >= queueLength - 1}
            className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#DCE5EF] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-35"
            type="button"
            aria-label="Next ayah"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={closePlayer}
            className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#B8C4D6] transition hover:bg-white/[0.08] hover:text-white"
            type="button"
            aria-label="Close audio player"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
