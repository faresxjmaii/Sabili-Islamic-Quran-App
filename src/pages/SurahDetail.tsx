import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QuranReader from '../components/QuranReader';
import { bookmarkService, fetchQalounSurah } from '../services/quranService';
import type { QalounAyah } from '../services/quranService';
import { VerseSkeleton } from '../components/Skeleton';

export default function SurahDetail() {
  const { surahId } = useParams<{ surahId: string }>();
  const surahIdNum = Number(surahId);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['qaloun-surah', surahIdNum],
    queryFn: () => fetchQalounSurah(surahIdNum),
    staleTime: 60 * 60 * 1000,
  });

  const addBookmark = (verse: QalounAyah) => {
    bookmarkService.set({
      surahId: verse.sura_no,
      surahName: verse.sura_name_en,
      verseNumber: verse.aya_no,
      verseKey: verse.verse_key,
    });
  };

  if (isLoading) return <VerseSkeleton />;
  if (isError || !data) return <div className="p-4 text-red-300">{String(error)}</div>;

  return (
    <QuranReader
      title={`${data.nameEn} - ${data.nameAr}`}
      subtitle={`Surah ${data.id} - ${data.versesCount} verses - Canonical Uthmani text`}
      badge={`Surah ${data.id}`}
      verses={data.verses}
      onBookmark={addBookmark}
    />
  );
}
