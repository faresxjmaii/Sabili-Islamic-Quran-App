import type { QalounAyah } from './quranService';

export const OPENING_BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

export type QuranReaderVerse = QalounAyah;

export type QuranDisplayItem =
  | {
      type: 'basmala';
      key: string;
      surahNumber: number;
      text: string;
    }
  | {
      type: 'ayah';
      key: string;
      verse: QuranReaderVerse;
    };

export function normalizeQuranVerses(verses: QalounAyah[]): QuranReaderVerse[] {
  return verses;
}

export function shouldShowOpeningBasmala(surahNumber: number): boolean {
  return surahNumber !== 1 && surahNumber !== 9;
}

export function getQuranDisplayItems(verses: QalounAyah[]): {
  audioVerses: QuranReaderVerse[];
  displayItems: QuranDisplayItem[];
} {
  const audioVerses = normalizeQuranVerses(verses);
  const displayedBasmalaForSurahs = new Set<number>();
  const displayItems: QuranDisplayItem[] = [];

  for (const verse of audioVerses) {
    if (verse.aya_no === 1 && shouldShowOpeningBasmala(verse.sura_no) && !displayedBasmalaForSurahs.has(verse.sura_no)) {
      displayItems.push({
        type: 'basmala',
        key: `basmala:${verse.sura_no}`,
        surahNumber: verse.sura_no,
        text: OPENING_BASMALA,
      });
      displayedBasmalaForSurahs.add(verse.sura_no);
    }

    displayItems.push({
      type: 'ayah',
      key: verse.verse_key,
      verse,
    });
  }

  return { audioVerses, displayItems };
}
