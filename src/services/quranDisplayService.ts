import type { QalounAyah } from './quranService';

export const OPENING_BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const STANDALONE_OPENING_SEGMENTS: Record<number, string[]> = {
  2: ['أَلَٓمِّٓۖ'],
  3: ['أَلَٓمِّٓۖ'],
  7: ['أَلَٓمِّٓصَٓۖ'],
  19: ['كَٓهَيَعَٓصَٓۖ'],
  20: ['طَهَۖ'],
  26: ['طَسِٓمِّٓۖ'],
  28: ['طَسِٓمِّٓۖ'],
  29: ['أَلَٓمِّٓۖ'],
  30: ['أَلَٓمِّٓۖ'],
  31: ['أَلَٓمِّٓۖ'],
  32: ['أَلَٓمِّٓۖ'],
  36: ['يَسِٓۖ'],
  40: ['حَمِٓۖ'],
  41: ['حَمِٓۖ'],
  42: ['حَمِٓ', 'عَٓسِٓقَٓۖ'],
  43: ['حَمِٓۖ'],
  44: ['حَمِٓۖ'],
  45: ['حَمِٓۖ'],
  46: ['حَمِٓۖ'],
};

const arabicIndicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const CANONICAL_AYAH_COUNTS = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98,
  135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54,
  53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

export type QuranReaderVerse = QalounAyah & {
  source_aya_no: number;
  source_aya_range?: [number, number];
};

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

function toArabicIndicNumber(value: number): string {
  return String(value)
    .split('')
    .map((digit) => arabicIndicDigits[Number(digit)] ?? digit)
    .join('');
}

function withAyahMarker(text: string, ayahNumber: number): string {
  const withoutMarker = text.trim().replace(/[\u00a0\s]*[٠-٩۰-۹0-9]+$/u, '').trim();
  return `${withoutMarker}\u00a0${toArabicIndicNumber(ayahNumber)}`;
}

function stripAyahMarker(text: string): string {
  return text.trim().replace(/[\u00a0\s]*[٠-٩۰-۹0-9]+$/u, '').trim();
}

function cloneVerse(verse: QalounAyah, ayahNumber: number, ayaText: string): QuranReaderVerse {
  return {
    ...verse,
    id: Number(`${verse.id}${String(ayahNumber).padStart(3, '0')}`),
    aya_no: ayahNumber,
    aya_text: withAyahMarker(ayaText, ayahNumber),
    source_aya_no: verse.aya_no,
  };
}

function normalizeAlFatihah(verses: QalounAyah[]): QuranReaderVerse[] {
  const firstVerse = verses[0];
  if (!firstVerse) return [];

  const basmalaVerse = cloneVerse(firstVerse, 1, OPENING_BASMALA);
  basmalaVerse.source_aya_no = 0;

  const middleVerses = verses.slice(0, 5).map((verse, index) => cloneVerse(verse, index + 2, verse.aya_text));
  const lastTwoVerses = verses.slice(5, 7);

  if (lastTwoVerses.length < 2) {
    return [basmalaVerse, ...middleVerses, ...verses.slice(5).map((verse, index) => cloneVerse(verse, index + 7, verse.aya_text))];
  }

  const mergedClosingVerse = cloneVerse(
    lastTwoVerses[0],
    7,
    `${stripAyahMarker(lastTwoVerses[0].aya_text)} ${lastTwoVerses[1].aya_text}`
  );

  return [basmalaVerse, ...middleVerses, mergedClosingVerse];
}

function splitOpeningVerse(firstVerse: QalounAyah): QuranReaderVerse[] | null {
  const segments = STANDALONE_OPENING_SEGMENTS[firstVerse.sura_no];
  if (!segments) return null;

  let remainder = firstVerse.aya_text.trim();
  const splitVerses: QuranReaderVerse[] = [];

  for (const [index, segment] of segments.entries()) {
    if (!remainder.startsWith(segment)) return null;
    splitVerses.push(cloneVerse(firstVerse, index + 1, segment));
    remainder = remainder.slice(segment.length).trim();
  }

  if (remainder) {
    splitVerses.push(cloneVerse(firstVerse, segments.length + 1, remainder));
  }

  return splitVerses;
}

export function normalizeQuranVerses(verses: QalounAyah[]): QuranReaderVerse[] {
  if (verses[0]?.sura_no === 1) return normalizeAlFatihah(verses);

  const normalized: QuranReaderVerse[] = [];
  let numberDelta = 0;
  const surahNumber = verses[0]?.sura_no ?? 0;
  const canonicalCount = CANONICAL_AYAH_COUNTS[surahNumber] ?? verses.length;

  for (let index = 0; index < verses.length; index += 1) {
    const verse = verses[index];
    const split = verse.aya_no === 1 ? splitOpeningVerse(verse) : null;
    const splitDelta = split ? split.length - 1 : 0;
    const splitFitsCanonicalCount = split ? verses.length + splitDelta <= canonicalCount : false;

    if (split && splitFitsCanonicalCount) {
      normalized.push(...split);
      numberDelta += split.length - 1;
      continue;
    }

    const ayahNumber = verse.aya_no + numberDelta;
    normalized.push(cloneVerse(verse, ayahNumber, verse.aya_text));
  }

  return normalized;
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
      key: `${verse.sura_no}:${verse.aya_no}`,
      verse,
    });
  }

  return { audioVerses, displayItems };
}
