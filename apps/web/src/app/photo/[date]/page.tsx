import { notFound } from 'next/navigation';
import { getJourneyStats, getPhotos } from '@/lib/api';
import PhotoJournal from '@/components/photo/PhotoJournal';
import { getServerLocale } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

const DATE_SLUG_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface PageProps {
  params: {
    date: string;
  };
}

export default async function PhotoByDatePage({ params }: PageProps) {
  const dateSlug = params.date?.trim();
  const locale = getServerLocale();

  if (!dateSlug || !DATE_SLUG_REGEX.test(dateSlug)) {
    notFound();
  }

  const [{ photos }, stats] = await Promise.all([
    getPhotos(1, 0, undefined, { startDate: dateSlug, endDate: dateSlug }, locale),
    getJourneyStats(),
  ]);

  if (!photos.length) {
    notFound();
  }

  return <PhotoJournal photo={photos[0]} stats={stats} activeHref="/" locale={locale} />;
}
