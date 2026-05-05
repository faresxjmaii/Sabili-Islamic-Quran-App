import { Loader2, Pause, Play } from 'lucide-react';
import { useQuranAudio } from '../app/useQuranAudio';
import type { QuranAudioVerse } from '../services/quranAudioService';

type AyahAudioButtonProps = {
  verse: QuranAudioVerse;
  queue: QuranAudioVerse[];
};

export default function AyahAudioButton({ verse, queue }: AyahAudioButtonProps) {
  const { isCurrentVerse, status, playVerse, togglePlayPause } = useQuranAudio();
  const active = isCurrentVerse(verse);
  const loading = active && status === 'loading';
  const playing = active && status === 'playing';

  return (
    <button
      onClick={() => {
        if (active) {
          togglePlayPause();
          return;
        }
        playVerse(verse, queue);
      }}
      className={[
        'grid size-9 place-items-center rounded-xl border transition sm:size-10 sm:rounded-2xl',
        active
          ? 'border-[#F2C66D]/45 bg-[#D9B45A]/14 text-[#F2C66D] shadow-[0_0_28px_rgba(217,180,90,0.14)]'
          : 'border-white/10 bg-white/[0.04] text-[#B8C4D6] hover:border-emerald-300/35 hover:bg-emerald-400/10 hover:text-[#10B981]',
      ].join(' ')}
      aria-label={playing ? 'Pause ayah audio' : 'Play ayah audio'}
      type="button"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : playing ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 fill-current" />
      )}
    </button>
  );
}
