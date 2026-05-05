import { createContext } from 'react';
import type { QuranAudioReciter, QuranAudioVerse, QuranLastPlayed } from '../services/quranAudioService';

export type QuranAudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export type QuranAudioContextValue = {
  status: QuranAudioStatus;
  currentVerse: QuranAudioVerse | null;
  currentVerseKey: string | null;
  currentIndex: number;
  queueLength: number;
  reciter: QuranAudioReciter;
  reciters: QuranAudioReciter[];
  lastPlayed: QuranLastPlayed | null;
  errorMessage: string;
  setReciter: (reciterId: string) => void;
  playVerse: (verse: QuranAudioVerse, queue?: QuranAudioVerse[]) => void;
  playQueue: (verses: QuranAudioVerse[], startIndex?: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  closePlayer: () => void;
  isCurrentVerse: (verse: QuranAudioVerse) => boolean;
};

export const QuranAudioContext = createContext<QuranAudioContextValue | null>(null);
