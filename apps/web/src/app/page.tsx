import Link from 'next/link';
import {
  ArrowRightIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { getLatestPhoto, getJourneyStats } from '@/lib/api';
import { ARCHIVE_NAV_ITEMS, getNavLinkClass } from '@/lib/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const photo = await getLatestPhoto();
  const stats = await getJourneyStats();

  if (!photo) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-4">
            Silicon Traveler
          </p>
          <h1 className="text-4xl font-serif mb-4">
            No photos published yet.
          </h1>
          <p className="text-white/60">
            The journal will open with the first published frame. Check back
            soon.
          </p>
          <Link
            href="/archive"
            className="inline-flex items-center gap-3 mt-8 text-[10px] font-bold uppercase tracking-[0.4em] border-b border-white/30 hover:border-white transition-all"
          >
            View Archive
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="px-6 md:px-12 lg:px-20 flex flex-1 justify-center py-8">
        <div className="flex flex-col w-full max-w-[1400px] flex-1">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-10">
            <div className="flex items-center gap-6">
              <div className="size-8 text-white">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4H44V44H4V4ZM24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold tracking-widest uppercase leading-none">
                  Silicon Traveler
                </h2>
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 mt-1">
                  Daily Documentary Observation
                </span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-12">
              {ARCHIVE_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  className={getNavLinkClass(item.href, '/', 'dark')}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="mt-12 flex flex-col lg:grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="w-full bg-zinc-900 overflow-hidden h-[calc(100vh-280px)] min-h-[360px] ring-1 ring-white/10 animate-fade-up">
                <img
                  alt={photo.title}
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
                  src={`/api/${photo.image_path}`}
                />
              </div>
              {(technicalPlate || photo.roll_number || photo.frame_number) && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">
                      Technical Plate
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
              className="lg:col-span-4 flex flex-col h-full pt-4 animate-fade-up"
              style={{ animationDelay: '120ms' }}
            >
              <div className="sticky top-12">
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
                  {photo.location && (
                    <div className="flex items-start gap-4">
                      <MapPinIcon className="h-5 w-5 text-white/30 mt-1" />
                      <div className="flex flex-col">
                        <span className="text-white/40 text-[9px] uppercase tracking-widest mb-1">
                          Location
                        </span>
                        <span className="text-white/80 text-sm font-light tracking-wide">
                          {photo.location}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      href="/archive"
                      className="group relative inline-flex items-center gap-6 py-4 pr-12 text-white border-b border-white/20 hover:border-white transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        Expand Archive
                      </span>
                      <ArrowRightIcon className="absolute right-0 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="mt-24 border-t border-white/10 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-white/30 text-[9px] uppercase tracking-[0.4em]">
              (c) {currentYear} Silicon Traveler - All Rights Reserved
            </div>
            <div className="flex items-center gap-12">
              <div className="flex gap-8">
                <Link
                  className="text-white/30 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]"
                  href="/archive"
                >
                  Archive
                </Link>
                <Link
                  className="text-white/30 hover:text-white transition-colors text-[9px] uppercase tracking-[0.3em]"
                  href="/"
                >
                  Journal
                </Link>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">
                  Volume
                </span>
                <span className="text-white text-[9px] font-bold">
                  {photo.volume_issue || '01 // 26'}
                </span>
              </div>
            </div>
          </footer>

          {stats && (
            <div className="pb-6 text-center text-xs text-white/40 tracking-[0.2em] uppercase">
              {stats.stats.photos_published} photos |{' '}
              {stats.stats.total_distance_km.toFixed(0)}km traveled |{' '}
              {stats.stats.route_points.reduce((sum, item) => sum + item.count, 0)} locations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
