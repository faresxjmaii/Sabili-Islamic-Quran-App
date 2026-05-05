const BASE_URL = 'https://api.quran.com/api/v4';

const CANONICAL_AYAH_COUNTS = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98,
  135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54,
  53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const MUQATTAAT_SURAHS = [
  2, 3, 7, 10, 11, 12, 13, 14, 15, 19, 20, 26, 27, 28, 29, 30, 31, 32, 36, 38, 40, 41, 42, 43, 44, 45, 46, 50, 68,
];

const STANDALONE_ASSERTIONS = new Map([
  ['19:1', 'كٓهيعٓصٓ'],
  ['2:1', 'الٓمٓ'],
  ['20:1', 'طه'],
  ['36:1', 'يسٓ'],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeArabic(text) {
  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u00a0\s]/g, '')
    .replace(/ٱ/g, 'ا');
}

async function fetchChapter(chapterNumber) {
  const url = `${BASE_URL}/verses/by_chapter/${chapterNumber}?fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number,hizb_number,page_number&per_page=300`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  assert(response.ok, `Failed to fetch chapter ${chapterNumber}: ${response.status}`);
  const data = await response.json();
  return data.verses;
}

const allKeys = new Set();
const chapters = new Map();

for (let chapterNumber = 1; chapterNumber <= 114; chapterNumber += 1) {
  const verses = await fetchChapter(chapterNumber);
  chapters.set(chapterNumber, verses);

  assert(
    verses.length === CANONICAL_AYAH_COUNTS[chapterNumber],
    `Chapter ${chapterNumber} has ${verses.length} verses, expected ${CANONICAL_AYAH_COUNTS[chapterNumber]}.`
  );

  for (let index = 0; index < verses.length; index += 1) {
    const verse = verses[index];
    const expectedKey = `${chapterNumber}:${index + 1}`;

    assert(verse.verse_key === expectedKey, `Expected ${expectedKey}, received ${verse.verse_key}.`);
    assert(!allKeys.has(verse.verse_key), `Duplicate verse_key ${verse.verse_key}.`);
    assert(typeof verse.text_uthmani === 'string' && verse.text_uthmani.trim(), `Missing text for ${verse.verse_key}.`);
    allKeys.add(verse.verse_key);
  }
}

for (const [verseKey, expectedText] of STANDALONE_ASSERTIONS) {
  const [chapterNumberText, verseNumberText] = verseKey.split(':');
  const verse = chapters.get(Number(chapterNumberText))[Number(verseNumberText) - 1];

  assert(
    normalizeArabic(verse.text_uthmani) === normalizeArabic(expectedText),
    `${verseKey} is not standalone as expected. Received: ${verse.text_uthmani}`
  );
}

for (const chapterNumber of MUQATTAAT_SURAHS) {
  const verses = chapters.get(chapterNumber).slice(0, 3);
  console.log(`\nSurah ${chapterNumber}`);
  for (const verse of verses) {
    console.log(`${verse.verse_key} ${verse.text_uthmani.trim()}`);
  }
}

console.log(`\nQuran canonical text validation passed for ${allKeys.size} verses.`);
