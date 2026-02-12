import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import Footer from '@/components/layout/Footer';
import ProgressiveImage from '@/components/photo/ProgressiveImage';
import type { JourneyStats, Photo } from '@/types';
import { getTranslations } from '@/lib/i18n/translations';
import { toProxyImageSrc } from '@/lib/images';

interface PhotoJournalProps {
  photo: Photo;
  stats: JourneyStats | null;
  activeHref?: string;
  locale?: string;
  prevPhotoDate?: string;
  nextPhotoDate?: string;
}

export default function PhotoJournal({
  photo,
  stats,
  activeHref = '/',
  locale = 'es',
  prevPhotoDate,
  nextPhotoDate,
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

  const technicalPlate = [
    photo.camera_model,
    photo.lens,
    photo.iso ? `ISO ${photo.iso}` : null,
    photo.shutter_speed,
  ]
    .filter(Boolean)
    .join(' / ');

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
          <div className="lg:flex-none lg:w-[calc(100vh-14rem)] lg:max-w-[60vw]">
            <div className="relative w-full bg-zinc-900 overflow-hidden aspect-square min-h-[320px] ring-1 ring-white/10 animate-fade-up">
              <ProgressiveImage
                alt={photo.title}
                className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-90"
                src={toProxyImageSrc(photo.image_path)}
                skeletonClassName="bg-zinc-800"
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
                <p className="font-narrative text-white/90 text-lg leading-relaxed italic whitespace-pre-wrap">
                  {photo.narrative}
                </p>
              </div>
              <div className="flex flex-col gap-8 border-t border-white/10 pt-10">
                {photo.location && (
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
                )}
                <div className="flex items-center gap-6">
                  {prevPhotoDate && (
                    <Link
                      href={`/photo/${prevPhotoDate}`}
                      className="group relative inline-flex items-center gap-6 py-4 pl-12 text-white border-b border-white/20 hover:border-white transition-all"
                    >
                      <ArrowLeftIcon className="absolute left-0 h-5 w-5 group-hover:-translate-x-2 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        {t.photo.prevPhoto}
                      </span>
                    </Link>
                  )}
                  {nextPhotoDate && (
                    <Link
                      href={`/photo/${nextPhotoDate}`}
                      className="group relative inline-flex items-center gap-6 py-4 pr-12 text-white border-b border-white/20 hover:border-white transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        {t.photo.nextPhoto}
                      </span>
                      <ArrowRightIcon className="absolute right-0 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

      </PageContainer>

      <Footer theme="dark" stats={stats} t={t} locale={locale} />
    </div>
  );
}
