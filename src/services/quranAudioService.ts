import type { QalounAyah } from './quranService';

const LAST_PLAYED_KEY = 'sakina_quran_audio_last_played';
const RECITER_KEY = 'sakina_quran_audio_reciter';

export type QuranAudioReciter = {
  id: string;
  name: string;
  label: string;
  source: 'EveryAyah';
  baseUrl: string;
};

export type QuranAudioVerse = Pick<
  QalounAyah,
  'sura_no' | 'aya_no' | 'sura_name_en' | 'sura_name_ar' | 'verse_key'
>;

export type QuranLastPlayed = {
  reciterId: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
  savedAt: number;
};

export const QURAN_AUDIO_RECITERS: QuranAudioReciter[] = [
  {
    id: 'alafasy-128',
    name: 'Mishary Rashid Alafasy',
    label: 'Audio recitation',
    source: 'EveryAyah',
    baseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
  },
  {
    id: 'husary-128',
    name: 'Mahmoud Khalil Al-Husary',
    label: 'Audio recitation',
    source: 'EveryAyah',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps',
  },
];

export function getDefaultReciter(): QuranAudioReciter {
  return QURAN_AUDIO_RECITERS[0];
}

export function getStoredReciter(): QuranAudioReciter {
  const reciterId = localStorage.getItem(RECITER_KEY);
  return QURAN_AUDIO_RECITERS.find((reciter) => reciter.id === reciterId) ?? getDefaultReciter();
}

export function storeReciter(reciterId: string): QuranAudioReciter {
  const reciter = QURAN_AUDIO_RECITERS.find((item) => item.id === reciterId) ?? getDefaultReciter();
  localStorage.setItem(RECITER_KEY, reciter.id);
  return reciter;
}

export function buildAyahAudioUrl(reciter: QuranAudioReciter, surahNumber: number, ayahNumber: number): string {
  const fileName = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${reciter.baseUrl}/${fileName}`;
}

export function getVerseKey(verse: QuranAudioVerse): string {
  return verse.verse_key;
}

export function saveLastPlayed(
  reciterId: string,
  verse: QuranAudioVerse,
  timestamp: number
): QuranLastPlayed {
  const payload: QuranLastPlayed = {
    reciterId,
    surahNumber: verse.sura_no,
    ayahNumber: verse.aya_no,
    surahName: verse.sura_name_en,
    timestamp,
    savedAt: Date.now(),
  };
  localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(payload));
  return payload;
}

export function getLastPlayed(): QuranLastPlayed | null {
  try {
    const stored = localStorage.getItem(LAST_PLAYED_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
