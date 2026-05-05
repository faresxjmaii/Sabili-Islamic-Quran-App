import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QuranReader from '../components/QuranReader';
import { fetchQalounHizb } from '../services/quranService';
import { VerseSkeleton } from '../components/Skeleton';

export default function HizbDetail() {
  const { hizbNumber } = useParams<{ hizbNumber: string }>();
  const hizbId = Number(hizbNumber);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['qaloun-hizb', hizbId],
    queryFn: () => fetchQalounHizb(hizbId),
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) return <VerseSkeleton />;
  if (isError || !data) return <div className="p-4 text-red-300">{String(error)}</div>;

  return (
    <QuranReader
      title={data.title}
      subtitle={`${data.subtitle} - ${data.verses.length} verses - Riwayat Qaloun`}
      badge={`Hizb ${data.id}`}
      verses={data.verses}
    />
  );
}
