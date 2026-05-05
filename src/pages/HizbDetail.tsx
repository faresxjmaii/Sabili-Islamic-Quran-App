import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QuranReader from '../components/QuranReader';
import { fetchQalounHizb } from '../services/quranService';
import { VerseSkeleton } from '../components/Skeleton';
import { useI18n } from '../i18n';

export default function HizbDetail() {
  const { hizbNumber } = useParams<{ hizbNumber: string }>();
  const hizbId = Number(hizbNumber);
  const { t } = useI18n();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['qaloun-hizb', hizbId],
    queryFn: () => fetchQalounHizb(hizbId),
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) return <VerseSkeleton />;
  if (isError || !data) return <div className="p-4 text-red-300">{String(error)}</div>;

  const juz = Math.ceil(data.id / 2);
  const hizbSubtitle = t(data.id % 2 === 1 ? 'firstHalfOfJuz' : 'secondHalfOfJuz', { juz });

  return (
    <QuranReader
      title={t('hizbTitle', { id: data.id })}
      subtitle={`${hizbSubtitle} - ${data.verses.length} ${t('verses')} - ${t('canonicalUthmaniText')}`}
      badge={t('hizbTitle', { id: data.id })}
      verses={data.verses}
      readerType="hizb"
      readerId={data.id}
    />
  );
}
