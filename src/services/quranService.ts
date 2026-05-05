import type { ChaptersResponse } from '../types';

const BASE_URL = 'https://api.quran.com/api/v4';

const defaultHeaders = {
  Accept: 'application/json',
};

const QALOON_DATA_URL =
  'https://raw.githubusercontent.com/thetruetruth/quran-data-kfgqpc/main/qaloon/data/QaloonData_v10.json';

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

export async function fetchChapters(language = 'en'): Promise<ChaptersResponse> {
  const url = `${BASE_URL}/chapters?language=${language}`;
  const res = await fetch(url, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Quran API error: ${res.status}`);
  return res.json();
}

export async function fetchQalounData(): Promise<QalounAyah[]> {
  if (qalounDataCache) return qalounDataCache;

  const res = await fetch(QALOON_DATA_URL, { headers: defaultHeaders });
  if (!res.ok) throw new Error(`Qaloun Quran data error: ${res.status}`);
  const data = (await res.json()) as QalounAyah[];
  qalounDataCache = data;
  return qalounDataCache;
}

export async function fetchQalounSurah(surahId: number): Promise<QalounSurah> {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    throw new Error('Invalid Surah number.');
  }

  const data = await fetchQalounData();
  const verses = data.filter((ayah) => ayah.sura_no === surahId);
  const first = verses[0];

  if (!first) throw new Error(`Surah ${surahId} was not found in Qaloun data.`);

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
  const [qalounData, verseKeys] = await Promise.all([
    fetchQalounData(),
    fetchHizbVerseKeys(hizbNumber),
  ]);
  const keySet = new Set(verseKeys);
  const verses = qalounData.filter((ayah) => keySet.has(`${ayah.sura_no}:${ayah.aya_no}`));
  const summary = getHizbSummaries().find((hizb) => hizb.id === hizbNumber);

  if (verses.length === 0) {
    throw new Error(`Hizb ${hizbNumber} did not resolve to Qaloun verses.`);
  }

  return {
    id: hizbNumber,
    title: summary?.title ?? `Hizb ${hizbNumber}`,
    subtitle: summary?.subtitle ?? 'Qaloun reading',
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
