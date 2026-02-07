import Link from 'next/link';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import type { JourneyStats, Photo } from '@/types';
import { getTranslations } from '@/lib/i18n/translations';

interface PhotoJournalProps {
  photo: Photo;
  stats: JourneyStats | null;
  activeHref?: string;
  locale?: string;
}

export default function PhotoJournal({
  photo,
  stats,
  activeHref = '/',
  locale = 'es',
}: PhotoJournalProps) {
  const t = getTranslations(locale);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const locationParts = photo.location
    ? photo.location.split(',').map((part) => part.trim()).filter(Boolean)
    : [];
  const locationPrimary = locationParts[0];
  const locationSecondary = locationParts.slice(1).join(', ');
  const currentYear = new Date().getFullYear();

  const technicalPlate = [
    photo.camera_model,
    photo.lens,
    photo.iso ? `ISO ${photo.iso}` : null,
    photo.shutter_speed,
  ]
    .filter(Boolean)
    .join(' / ');
  const numberFormatter = new Intl.NumberFormat(locale);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <SectionTopBar
        title={t.nav.journal}
        theme="dark"
        activeHref={activeHref}
        className="border-b border-white/10"
        navLabels={t.nav}
      />

      <PageContainer className="flex flex-col py-6">
        <main className="mt-8 flex flex-col lg:flex-row gap-12">
          <div className="lg:flex-none">
            <div className="w-full max-w-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] bg-zinc-900 overflow-hidden aspect-square min-h-[320px] ring-1 ring-white/10 animate-fade-up">
              <img
                alt={photo.title}
                className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-90"
                src={`/api/images/${photo.image_path.replace(/^\//, '')}`}
              />
            </div>
            {(technicalPlate || photo.roll_number || photo.frame_number) && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">
                    {t.photo.technicalPlate}
                  </span>
                  {technicalPlate && (
                    <span className="text-xs font-medium text-white/60 tracking-wider">
                      {technicalPlate}
                    </span>
                  )}
                  {(photo.roll_number || photo.frame_number) && (
                    <span className="text-xs font-medium text-white/40 tracking-wider">
                      {[photo.roll_number, photo.frame_number]
                        .filter(Boolean)
                        .join(' / ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="lg:flex-1 flex flex-col h-full pt-4 animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-white/40"></div>
                <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                  {formatDate(photo.published_at)}
                </p>
              </div>
              <h1 className="text-white tracking-tight text-5xl font-light mb-3 font-serif">
                {locationPrimary || photo.title}
                {locationSecondary && (
                  <>
                    , <span className="italic">{locationSecondary}</span>
                  </>
                )}
              </h1>
              {locationPrimary && (
                <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-8">
                  {photo.title}
                </p>
              )}
              <div className="mb-10">
                <p className="font-serif text-white/90 text-xl leading-relaxed italic whitespace-pre-wrap">
                  {photo.narrative}
                </p>
              </div>
              <div className="flex flex-col gap-8 border-t border-white/10 pt-10">
                {photo.location ? (
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <MapPinIcon className="h-5 w-5 text-white/30 mt-1" />
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[9px] uppercase tracking-widest mb-1">
                          {t.photo.location}
                        </span>
                        <span className="text-white/80 text-sm font-light tracking-wide">
                          {photo.location}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/archive"
                      className="group relative inline-flex items-center gap-6 py-4 pr-12 text-white border-b border-white/20 hover:border-white transition-all sm:self-start"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        {t.photo.expandArchive}
                      </span>
                      <ArrowRightIcon className="absolute right-0 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Link
                      href="/archive"
                      className="group relative inline-flex items-center gap-6 py-4 pr-12 text-white border-b border-white/20 hover:border-white transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        {t.photo.expandArchive}
                      </span>
                      <ArrowRightIcon className="absolute right-0 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-16 border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white/30 text-[9px] uppercase tracking-[0.4em]">
            (c) {currentYear} Silicon Traveler - {t.photo.allRights}
          </div>
          <div className="flex items-center gap-12">
            <div className="flex gap-8">
              <Link
                className="text-white/30 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]"
                href="/archive"
              >
                {t.nav.archive}
              </Link>
              <Link
                className="text-white/30 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]"
                href="/"
              >
                {t.nav.journal}
              </Link>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">
                {t.photo.volume}
              </span>
              <span className="text-white text-[9px] font-bold">
                {photo.volume_issue || '01 // 26'}
              </span>
            </div>
          </div>
        </footer>

        {stats && (
          <div className="pb-4 text-center text-xs text-white/40 tracking-[0.2em] uppercase">
            {t.stats.line(
              numberFormatter.format(stats.stats.photos_published),
              numberFormatter.format(Math.round(stats.stats.total_distance_km)),
              numberFormatter.format(
                stats.stats.route_points.reduce((sum, item) => sum + item.count, 0)
              )
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
