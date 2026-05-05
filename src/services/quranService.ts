import type { ChaptersResponse } from '../types';

const BASE_URL = 'https://api.quran.com/api/v4';

const defaultHeaders = {
  Accept: 'application/json',
};

export type QalounAyah = {
  id: number;
  jozz: number;
  page: string;
  sura_no: number;
  sura_name_en: string;
  sura_name_ar: string;
  line_start: number;
  line_end: number;
  aya_no: number;
  aya_text: string;
  verse_key: string;
  text_uthmani: string;
  hizb_number?: number;
};

export type QalounSurah = {
  id: number;
  nameEn: string;
  nameAr: string;
  versesCount: number;
  verses: QalounAyah[];
};

export type HizbSummary = {
  id: number;
  title: string;
  subtitle: string;
};

let qalounDataCache: QalounAyah[] | null = null;
let chaptersCache: ChaptersResponse | null = null;

type QuranApiVerse = {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  hizb_number?: number;
};

export async function fetchChapters(language = 'en'): Promise<ChaptersResponse> {
  if (language === 'en' && chaptersCache) return chaptersCache;

  const url = `${BASE_URL}/chapters?language=${language}`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Quran API error: ${res.status}`);
  const data = (await res.json()) as ChaptersResponse;
  if (language === 'en') chaptersCache = data;
  return data;
}

async function getChapterMeta() {
  const chapters = await fetchChapters('en');
  return new Map(chapters.chapters.map((chapter) => [chapter.id, chapter]));
}

function toCanonicalAyah(verse: QuranApiVerse, chapterMap: Map<number, ChaptersResponse['chapters'][number]>): QalounAyah {
  const chapter = chapterMap.get(verse.chapter_id);

  return {
    id: verse.id,
    jozz: verse.juz_number,
    page: String(verse.page_number),
    sura_no: verse.chapter_id,
    sura_name_en: chapter?.name_simple ?? `Surah ${verse.chapter_id}`,
    sura_name_ar: chapter?.name_arabic ?? '',
    line_start: 0,
    line_end: 0,
    aya_no: verse.verse_number,
    aya_text: verse.text_uthmani.trim(),
    verse_key: verse.verse_key,
    text_uthmani: verse.text_uthmani.trim(),
    hizb_number: verse.hizb_number,
  };
}

export async function fetchQalounData(): Promise<QalounAyah[]> {
  if (qalounDataCache) return qalounDataCache;

  const chapterMap = await getChapterMeta();
  const chapters = Array.from({ length: 114 }, (_, index) => index + 1);
  const chapterVerses = await Promise.all(chapters.map((chapterNumber) => fetchCanonicalSurahVerses(chapterNumber, chapterMap)));
  qalounDataCache = chapterVerses.flat();
  return qalounDataCache;
}

async function fetchCanonicalSurahVerses(
  surahId: number,
  chapterMap: Map<number, ChaptersResponse['chapters'][number]>
): Promise<QalounAyah[]> {
  const url = `${BASE_URL}/verses/by_chapter/${surahId}?fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number,hizb_number,page_number&per_page=300`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Quran verses API error: ${res.status}`);
  const data = (await res.json()) as { verses: QuranApiVerse[] };
  return data.verses.map((verse) => toCanonicalAyah(verse, chapterMap));
}

export async function fetchQalounSurah(surahId: number): Promise<QalounSurah> {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    throw new Error('Invalid Surah number.');
  }

  const chapterMap = await getChapterMeta();
  const verses = await fetchCanonicalSurahVerses(surahId, chapterMap);
  const first = verses[0];

  if (!first) throw new Error(`Surah ${surahId} was not found in Quran data.`);

  return {
    id: surahId,
    nameEn: first.sura_name_en,
    nameAr: first.sura_name_ar,
    versesCount: verses.length,
    verses,
  };
}

export function getHizbSummaries(): HizbSummary[] {
  return Array.from({ length: 60 }, (_, index) => {
    const id = index + 1;
    const juz = Math.ceil(id / 2);
    const half = id % 2 === 1 ? 'First half' : 'Second half';

    return {
      id,
      title: `Hizb ${id}`,
      subtitle: `${half} of Juz ${juz}`,
    };
  });
}

export async function fetchHizbVerseKeys(hizbNumber: number): Promise<string[]> {
  if (!Number.isInteger(hizbNumber) || hizbNumber < 1 || hizbNumber > 60) {
    throw new Error('Invalid Hizb number.');
  }

  const url = `${BASE_URL}/verses/by_hizb/${hizbNumber}?fields=verse_key&page=1&per_page=300`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Quran Hizb API error: ${res.status}`);
  const data = await res.json();
  return data.verses.map((verse: { verse_key: string }) => verse.verse_key);
}

export async function fetchQalounHizb(hizbNumber: number): Promise<{
  id: number;
  title: string;
  subtitle: string;
  verses: QalounAyah[];
}> {
  const [chapterMap, verseKeys] = await Promise.all([getChapterMeta(), fetchHizbVerseKeys(hizbNumber)]);
  const url = `${BASE_URL}/verses/by_hizb/${hizbNumber}?fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number,hizb_number,page_number&per_page=300`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Quran Hizb API error: ${res.status}`);
  const data = (await res.json()) as { verses: QuranApiVerse[] };
  const keySet = new Set(verseKeys);
  const verses = data.verses
    .map((verse) => toCanonicalAyah(verse, chapterMap))
    .filter((ayah) => keySet.has(ayah.verse_key));
  const summary = getHizbSummaries().find((hizb) => hizb.id === hizbNumber);

  if (verses.length === 0) {
    throw new Error(`Hizb ${hizbNumber} did not resolve to Quran verses.`);
  }

  return {
    id: hizbNumber,
    title: summary?.title ?? `Hizb ${hizbNumber}`,
    subtitle: summary?.subtitle ?? 'Canonical Quran reading',
    verses,
  };
}

const BOOKMARK_KEY = 'sakina_bookmark';

export interface QuranBookmark {
  surahId: number;
  surahName: string;
  verseNumber: number;
  verseKey: string;
  savedAt: number;
}

export const bookmarkService = {
  get(): QuranBookmark | null {
    try {
      const stored = localStorage.getItem(BOOKMARK_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  set(bookmark: Omit<QuranBookmark, 'savedAt'>): QuranBookmark {
    const full: QuranBookmark = { ...bookmark, savedAt: Date.now() };
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(full));
    return full;
  },

  clear(): void {
    localStorage.removeItem(BOOKMARK_KEY);
  },
};
