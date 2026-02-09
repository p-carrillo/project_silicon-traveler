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

function formatDateSlug(publishedAt: string): string {
  const match = publishedAt.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function dayBefore(dateSlug: string): string {
  const date = new Date(dateSlug + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function dayAfter(dateSlug: string): string {
  const date = new Date(dateSlug + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default async function PhotoByDatePage({ params }: PageProps) {
  const dateSlug = params.date?.trim();
  const locale = getServerLocale();

  if (!dateSlug || !DATE_SLUG_REGEX.test(dateSlug)) {
    notFound();
  }

  const [{ photos }, stats, { photos: prevPhotos }, { photos: nextPhotos }] =
    await Promise.all([
      getPhotos(1, 0, undefined, { startDate: dateSlug, endDate: dateSlug }, locale),
      getJourneyStats(),
      getPhotos(1, 0, undefined, { endDate: dayBefore(dateSlug) }, locale),
      getPhotos(1, 0, undefined, { startDate: dayAfter(dateSlug) }, locale),
    ]);

  if (!photos.length) {
    notFound();
  }

  const prevPhotoDate = prevPhotos.length > 0
    ? formatDateSlug(prevPhotos[0].published_at)
    : undefined;
  const nextPhotoDate = nextPhotos.length > 0
    ? formatDateSlug(nextPhotos[0].published_at)
    : undefined;

  return (
    <PhotoJournal
      photo={photos[0]}
      stats={stats}
      activeHref="/"
      locale={locale}
      prevPhotoDate={prevPhotoDate}
      nextPhotoDate={nextPhotoDate}
    />
  );
}
