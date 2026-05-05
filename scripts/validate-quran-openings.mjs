import fs from 'node:fs';
import ts from 'typescript';

const QALOON_DATA_URL =
  'https://raw.githubusercontent.com/thetruetruth/quran-data-kfgqpc/main/qaloon/data/QaloonData_v10.json';

const MUQATTAAT_SURAHS = [
  2, 3, 7, 10, 11, 12, 13, 14, 15, 19, 20, 26, 27, 28, 29, 30, 31, 32, 36, 38, 40, 41, 42, 43, 44, 45, 46, 50, 68,
];

const CANONICAL_AYAH_COUNTS = [
  0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98,
  135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54,
  53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30,
  20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function getVerseKey(verse) {
  return `${verse.sura_no}:${verse.aya_no}`;
}

function loadDisplayService() {
  const source = fs.readFileSync('src/services/quranDisplayService.ts', 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2023,
    },
  }).outputText;

  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [{ getQuranDisplayItems }, qalounData] = await Promise.all([
  loadDisplayService(),
  fetch(QALOON_DATA_URL).then((response) => response.json()),
]);

for (const surahNumber of MUQATTAAT_SURAHS) {
  const sourceVerses = qalounData.filter((ayah) => ayah.sura_no === surahNumber);
  const { audioVerses, displayItems } = getQuranDisplayItems(sourceVerses);
  const playableDisplayKeys = displayItems
    .filter((item) => item.type === 'ayah')
    .map((item) => getVerseKey(item.verse));
  const audioKeys = audioVerses.map(getVerseKey);
  const uniqueKeys = new Set(audioKeys);
  const displayOnlyBasmalaCount = displayItems.filter((item) => item.type === 'basmala').length;

  assert(audioKeys.length === uniqueKeys.size, `Surah ${surahNumber} has duplicate audio verse keys.`);
  assert(
    JSON.stringify(playableDisplayKeys) === JSON.stringify(audioKeys),
    `Surah ${surahNumber} display ayahs do not match the audio queue.`
  );
  assert(
    surahNumber === 9 || displayOnlyBasmalaCount === 1,
    `Surah ${surahNumber} should have one display-only opening Basmala.`
  );
  assert(
    surahNumber !== 9 || displayOnlyBasmalaCount === 0,
    'Surah 9 must not display an opening Basmala.'
  );

  console.log(`\nSurah ${surahNumber}`);
  console.log(`audio:   ${audioKeys.slice(0, 5).join(', ')}`);
  console.log(`count:   source ${sourceVerses.length}, audio ${audioKeys.length}, canonical ${CANONICAL_AYAH_COUNTS[surahNumber]}`);
  console.log(
    `display: ${displayItems
      .slice(0, 6)
      .map((item) => (item.type === 'basmala' ? `basmala:${item.surahNumber}` : getVerseKey(item.verse)))
      .join(', ')}`
  );
  console.log(`source:  ${sourceVerses.slice(0, 5).map(getVerseKey).join(', ')}`);
}

console.log('\nQuran opening validation passed.');
