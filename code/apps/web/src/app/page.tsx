import Link from 'next/link';
import { getLatestPhoto, getJourneyStats, getPhotos } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import PhotoJournal from '@/components/photo/PhotoJournal';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

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

export default async function HomePage() {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const photo = await getLatestPhoto(locale);
  const stats = await getJourneyStats();

  if (!photo) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SectionTopBar
          title={t.nav.journal}
          theme="dark"
          activeHref="/"
          className="border-b border-white/10"
          navLabels={t.nav}
        />
        <PageContainer className="py-20 flex flex-1 items-center justify-center">
          <div className="text-center max-w-xl">
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-4">
              Silicon Traveler
            </p>
            <h1 className="text-4xl font-serif mb-4">
              {t.home.noPhotosTitle}
            </h1>
            <p className="text-white/60">
              {t.home.noPhotosBody}
            </p>
            <Link
              href="/archive"
              className="inline-flex items-center gap-3 mt-8 text-[10px] font-bold uppercase tracking-[0.4em] border-b border-white/30 hover:border-white transition-all"
            >
              {t.home.viewArchive}
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const currentDateSlug = formatDateSlug(photo.published_at);
  const { photos: prevPhotos } = await getPhotos(
    1, 0, undefined,
    { endDate: dayBefore(currentDateSlug) },
    locale
  );
  const prevPhotoDate = prevPhotos.length > 0
    ? formatDateSlug(prevPhotos[0].published_at)
    : undefined;

  return (
    <PhotoJournal
      photo={photo}
      stats={stats}
      activeHref="/"
      locale={locale}
      prevPhotoDate={prevPhotoDate}
    />
  );
}
