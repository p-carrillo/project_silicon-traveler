import Link from 'next/link';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { getPhotos, getJourneyStats } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import SearchBar from '@/components/SearchBar';
import DateRangeAction from '@/components/DateRangeAction';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { page?: string; q?: string; start_date?: string; end_date?: string };
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const limit = 8;
  const offset = (currentPage - 1) * limit;
  const query = searchParams.q?.trim() ?? '';
  const startDate = searchParams.start_date?.trim() ?? '';
  const endDate = searchParams.end_date?.trim() ?? '';
  
  const { photos, pagination } = await getPhotos(limit, offset, query, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const stats = await getJourneyStats();
  
  const totalPages = Math.ceil(pagination.count / limit);
  const hasQuery = query.length > 0;
  const hasFilters = hasQuery || startDate.length > 0 || endDate.length > 0;

  const groupedPhotos = Object.values(
    photos.reduce(
      (acc, photo) => {
        const date = new Date(photo.published_at);
        const groupKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!acc[groupKey]) {
          acc[groupKey] = { date, photos: [] };
        }
        acc[groupKey].photos.push(photo);
        return acc;
      },
      {} as Record<string, { date: Date; photos: typeof photos }>
    )
  )
    .map((group) => ({
      ...group,
      photos: group.photos.sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      ),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatMonthLabel = (date: Date) => {
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date
    );
    return `${month} '${String(date.getFullYear()).slice(-2)}`;
  };

  const formatSheetLabel = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `Sheet ${month} / ${date.getFullYear()}`;
  };

  const formatDayLabel = (date: Date) => {
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(date);
    return label.toUpperCase();
  };

  const formatPhotoDateSlug = (publishedAt: string) => {
    const match = publishedAt.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];

    const parsed = new Date(publishedAt);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (hasQuery) params.set('q', query);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return `/archive?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <SectionTopBar
        title="Archive"
        theme="light"
        activeHref="/archive"
        className="sticky top-0 z-50 border-b border-black bg-white/95 backdrop-blur-sm"
      />

      <main className="flex-1">
        <section className="border-b border-black">
          <PageContainer className="flex flex-col md:flex-row">
            <div className="flex-1 border-b md:border-b-0 md:border-r border-black p-8">
              <SearchBar
                initialQuery={query}
                extraParams={{
                  start_date: startDate || undefined,
                  end_date: endDate || undefined,
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto">
              <DateRangeAction
                initialStartDate={startDate}
                initialEndDate={endDate}
                buttonClassName="px-10 py-6 sm:py-8 border-b sm:border-b-0 sm:border-r border-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest w-full"
              />
              <Link
                href="/map"
                className="px-10 py-6 sm:py-8 border-b sm:border-b-0 border-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest text-center"
              >
                Geography
              </Link>
            </div>
          </PageContainer>
        </section>

        <section className="contact-sheet-grid min-h-screen py-8 animate-fade-in">
          <PageContainer>
            {photos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg font-archive italic">
                  {hasFilters ? 'No results. Refine your search.' : 'No photos published yet.'}
                </p>
                {hasFilters ? (
                  <Link
                    href="/archive"
                    className="text-xs font-medium normal-case tracking-widest hover:underline mt-6 inline-block"
                  >
                    View all photos
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="text-xs font-black uppercase tracking-widest hover:underline mt-6 inline-block"
                  >
                    Return to Journal
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {groupedPhotos.map((group) => {
                  const seriesLabel =
                    group.photos.find((photo) => photo.series_name)?.series_name ||
                    'Silicon Traveler Journal';
                  return (
                    <div key={group.date.toISOString()} className="mb-20">
                      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 border-b-2 border-black pb-4 gap-6">
                        <div className="flex items-baseline gap-4">
                          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">
                            {formatMonthLabel(group.date)}
                          </h2>
                          <span className="text-sm font-archive italic text-gray-500">
                            {seriesLabel}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase">
                          {formatSheetLabel(group.date)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {group.photos.map((photo, index) => {
                          const publishedDate = new Date(photo.published_at);
                          const rollLabel = photo.roll_number
                            ? photo.roll_number.toUpperCase()
                            : `ROLL ${String(photo.id).padStart(3, '0')}`;
                          const frameLabel = photo.frame_number
                            ? String(photo.frame_number).padStart(2, '0')
                            : String(index + 1).padStart(2, '0');
                          const dateSlug = formatPhotoDateSlug(photo.published_at);
                          const photoHref = dateSlug ? `/photo/${dateSlug}` : `/photo/${photo.id}`;

                          return (
                            <Link
                              key={photo.id}
                              href={photoHref}
                              className="photo-frame group"
                            >
                              <div className="flex justify-between items-center mb-2 negative-strip-font text-gray-400">
                                <span>{formatDayLabel(publishedDate)}</span>
                                <span>
                                  {rollLabel} - {frameLabel}
                                </span>
                              </div>
                              <div className="aspect-square bg-gray-100 overflow-hidden">
                                <img
                                  alt={photo.title}
                                  className="w-full h-full object-cover img-bw transition-all duration-700"
                                  src={`/api/images/${photo.thumbnail_path.replace(/^\//, '')}`}
                                />
                              </div>
                              <div className="mt-4 flex justify-between items-start">
                                <div>
                                  <h3 className="text-xs font-black uppercase tracking-widest">
                                    {photo.title}
                                  </h3>
                                  <p className="text-[10px] text-gray-500 uppercase mt-1">
                                    {photo.location || 'Unknown location'}
                                  </p>
                                </div>
                                <BookmarkIcon className="h-4 w-4" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {hasFilters && (
                  <div className="mt-10 flex justify-center">
                    <Link
                      href="/archive"
                      className="text-xs font-medium normal-case tracking-widest hover:underline"
                    >
                      View all photos
                    </Link>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-24 mb-20 flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      {currentPage > 1 ? (
                        <Link
                          href={buildPageHref(currentPage - 1)}
                          className="w-12 h-12 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-xs font-bold"
                        >
                          Prev
                        </Link>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center border border-gray-300 text-gray-300 text-xs font-bold">
                          Prev
                        </div>
                      )}
                      
                      {/* First page */}
                      <Link
                        href={buildPageHref(1)}
                        className={`w-12 h-12 flex items-center justify-center border border-black transition-colors font-black text-xs ${
                          currentPage === 1
                            ? 'bg-black text-white'
                            : 'hover:bg-black hover:text-white'
                        }`}
                      >
                        01
                      </Link>
                      
                      {/* Show pages around current */}
                      {currentPage > 3 && (
                        <div className="w-12 h-12 flex items-center justify-center text-xs">
                          ...
                        </div>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page > 1 &&
                            page < totalPages &&
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page) => (
                          <Link
                            key={page}
                            href={buildPageHref(page)}
                            className={`w-12 h-12 flex items-center justify-center border border-black transition-colors font-black text-xs ${
                              currentPage === page
                                ? 'bg-black text-white'
                                : 'hover:bg-black hover:text-white'
                            }`}
                          >
                            {String(page).padStart(2, '0')}
                          </Link>
                        ))}
                      
                      {currentPage < totalPages - 2 && totalPages > 3 && (
                        <div className="w-12 h-12 flex items-center justify-center text-xs">
                          ...
                        </div>
                      )}
                      
                      {/* Last page */}
                      {totalPages > 1 && (
                        <Link
                          href={buildPageHref(totalPages)}
                          className={`w-12 h-12 flex items-center justify-center border border-black transition-colors font-black text-xs ${
                            currentPage === totalPages
                              ? 'bg-black text-white'
                              : 'hover:bg-black hover:text-white'
                          }`}
                        >
                          {String(totalPages).padStart(2, '0')}
                        </Link>
                      )}
                      
                      {currentPage < totalPages ? (
                        <Link
                          href={buildPageHref(currentPage + 1)}
                          className="w-12 h-12 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors text-xs font-bold"
                        >
                          Next
                        </Link>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center border border-gray-300 text-gray-300 text-xs font-bold">
                          Next
                        </div>
                      )}
                    </div>
                    <p className="mt-6 text-[10px] font-bold tracking-widest uppercase text-gray-400">
                      Visualizing {offset + 1}-{Math.min(offset + limit, pagination.count)} of {pagination.count} frames | Page {currentPage} of {totalPages}
                    </p>
                  </div>
                )}
              </div>
            )}
          </PageContainer>
        </section>
      </main>

      <footer className="border-t border-black bg-white">
        <PageContainer className="py-8 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-md">
            <h4 className="text-xs font-black uppercase tracking-widest mb-4">
              The Silicon Traveler Archive
            </h4>
            <p className="text-sm font-archive leading-relaxed text-gray-600">
              A daily exercise in observation. One photograph, one reflection,
              every 24 hours. A lifetime of seeing, cataloged and preserved for
              the public record.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="flex gap-8">
              <Link
                className="text-xs font-black uppercase tracking-widest hover:underline"
                href="/"
              >
                Journal
              </Link>
              <Link
                className="text-xs font-black uppercase tracking-widest hover:underline"
                href="/archive"
              >
                Archive
              </Link>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {stats
                ? `${stats.stats.photos_published} frames | ${stats.stats.total_distance_km.toFixed(0)}km traveled`
                : 'Documenting the journey'}
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
