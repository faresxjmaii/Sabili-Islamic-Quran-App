import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { QuranAudioContext, type QuranAudioStatus } from './QuranAudioContext';
import { useI18n } from '../i18n';
import {
  buildAyahAudioUrl,
  getDefaultReciter,
  getLastPlayed,
  getStoredReciter,
  getVerseKey,
  QURAN_AUDIO_RECITERS,
  saveLastPlayed,
  storeReciter,
  type QuranAudioReciter,
  type QuranAudioVerse,
  type QuranLastPlayed,
} from '../services/quranAudioService';

type QuranAudioProviderProps = {
  children: ReactNode;
};

export function QuranAudioProvider({ children }: QuranAudioProviderProps) {
  const { t } = useI18n();
  const [audio] = useState(() => {
    const element = new Audio();
    element.preload = 'metadata';
    return element;
  });
  const audioRef = useRef<HTMLAudioElement | null>(audio);
  const queueRef = useRef<QuranAudioVerse[]>([]);
  const indexRef = useRef(-1);
  const reciterRef = useRef<QuranAudioReciter>(getDefaultReciter());
  const [status, setStatus] = useState<QuranAudioStatus>('idle');
  const [currentVerse, setCurrentVerse] = useState<QuranAudioVerse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [queueLength, setQueueLength] = useState(0);
  const [reciter, setReciterState] = useState<QuranAudioReciter>(() => getStoredReciter());
  const [lastPlayed, setLastPlayed] = useState<QuranLastPlayed | null>(() => getLastPlayed());
  const [errorMessage, setErrorMessage] = useState('');

  const failAudioPlayback = useCallback(() => {
    setStatus('error');
    setErrorMessage(t('quranAudioUnavailable'));
  }, [t]);

  const persistLastPlayed = useCallback((verse: QuranAudioVerse) => {
    const audio = audioRef.current;
    const timestamp = audio ? Math.floor(audio.currentTime) : 0;
    setLastPlayed(saveLastPlayed(reciterRef.current.id, verse, timestamp));
  }, []);

  const startAt = useCallback((index: number) => {
    const queue = queueRef.current;
    const verse = queue[index];
    const audio = audioRef.current;
    if (!verse || !audio) {
      failAudioPlayback();
      return;
    }

    indexRef.current = index;
    setCurrentIndex(index);
    setCurrentVerse(verse);
    setQueueLength(queue.length);
    setErrorMessage('');
    setStatus('loading');

    audio.src = buildAyahAudioUrl(reciterRef.current, verse.sura_no, verse.aya_no);
    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        setStatus('playing');
        persistLastPlayed(verse);
      })
      .catch(failAudioPlayback);
  }, [failAudioPlayback, persistLastPlayed]);

  useEffect(() => {
    reciterRef.current = reciter;
  }, [reciter]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlaying = () => setStatus('playing');
    const handleWaiting = () => setStatus('loading');
    const handlePause = () => {
      if (!audio.ended) setStatus('paused');
    };
    const handleError = () => failAudioPlayback();
    const handleEnded = () => {
      const nextIndex = indexRef.current + 1;
      if (nextIndex < queueRef.current.length) {
        startAt(nextIndex);
        return;
      }
      setStatus('paused');
    };
    const handleTimeUpdate = () => {
      const verse = queueRef.current[indexRef.current];
      if (verse) persistLastPlayed(verse);
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [failAudioPlayback, persistLastPlayed, startAt]);

  const playQueue = useCallback((verses: QuranAudioVerse[], startIndex = 0) => {
    if (verses.length === 0) return;
    queueRef.current = verses;
    setQueueLength(verses.length);
    startAt(Math.max(0, Math.min(startIndex, verses.length - 1)));
  }, [startAt]);

  const playVerse = useCallback((verse: QuranAudioVerse, queue?: QuranAudioVerse[]) => {
    const verses = queue ?? [verse];
    const index = Math.max(0, verses.findIndex((item) => getVerseKey(item) === getVerseKey(verse)));
    playQueue(verses, index);
  }, [playQueue]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentVerse) return;

    if (audio.paused) {
      setStatus('loading');
      audio.play().then(() => setStatus('playing')).catch(failAudioPlayback);
      return;
    }

    audio.pause();
    setStatus('paused');
  }, [currentVerse, failAudioPlayback]);

  const playNext = useCallback(() => {
    const nextIndex = indexRef.current + 1;
    if (nextIndex < queueRef.current.length) startAt(nextIndex);
  }, [startAt]);

  const playPrevious = useCallback(() => {
    const previousIndex = indexRef.current - 1;
    if (previousIndex >= 0) startAt(previousIndex);
  }, [startAt]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    queueRef.current = [];
    indexRef.current = -1;
    setCurrentVerse(null);
    setCurrentIndex(-1);
    setQueueLength(0);
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const setReciter = useCallback((reciterId: string) => {
    const nextReciter = storeReciter(reciterId);
    setReciterState(nextReciter);
    reciterRef.current = nextReciter;
  }, []);

  const value = useMemo(() => ({
    status,
    currentVerse,
    currentVerseKey: currentVerse ? getVerseKey(currentVerse) : null,
    currentIndex,
    queueLength,
    reciter,
    reciters: QURAN_AUDIO_RECITERS,
    lastPlayed,
    errorMessage,
    setReciter,
    playVerse,
    playQueue,
    togglePlayPause,
    playNext,
    playPrevious,
    closePlayer,
    isCurrentVerse: (verse: QuranAudioVerse) =>
      Boolean(currentVerse && getVerseKey(currentVerse) === getVerseKey(verse)),
  }), [
    closePlayer,
    currentIndex,
    currentVerse,
    errorMessage,
    lastPlayed,
    playNext,
    playPrevious,
    playQueue,
    playVerse,
    queueLength,
    reciter,
    setReciter,
    status,
    togglePlayPause,
  ]);

  return <QuranAudioContext.Provider value={value}>{children}</QuranAudioContext.Provider>;
}
