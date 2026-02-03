import { notFound } from 'next/navigation';
import { getJourneyStats, getPhotos } from '@/lib/api';
import PhotoJournal from '@/components/photo/PhotoJournal';

export const dynamic = 'force-dynamic';

const DATE_SLUG_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface PageProps {
  params: {
    date: string;
  };
}

export default async function PhotoByDatePage({ params }: PageProps) {
  const dateSlug = params.date?.trim();

  if (!dateSlug || !DATE_SLUG_REGEX.test(dateSlug)) {
    notFound();
  }

  const [{ photos }, stats] = await Promise.all([
    getPhotos(1, 0, undefined, { startDate: dateSlug, endDate: dateSlug }),
    getJourneyStats(),
  ]);

  if (!photos.length) {
    notFound();
  }

  return <PhotoJournal photo={photos[0]} stats={stats} activeHref="/" />;
}
