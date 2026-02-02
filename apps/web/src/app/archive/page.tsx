import Link from 'next/link';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { getPhotos, getJourneyStats } from '@/lib/api';
import { ARCHIVE_NAV_ITEMS, getNavLinkClass } from '@/lib/navigation';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { page?: string };
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const limit = 8;
  const offset = (currentPage - 1) * limit;
  
  const { photos, pagination } = await getPhotos(limit, offset);
  const stats = await getJourneyStats();
  
  const totalPages = Math.ceil(pagination.count / limit);

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

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 md:px-8 py-8 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
            The Archive
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold mt-1 text-gray-500">
            Silicon Traveler Records
          </p>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          {ARCHIVE_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={getNavLinkClass(item.href, '/archive', 'light')}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <section className="border-b border-black">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row">
            <div className="flex-1 border-b md:border-b-0 md:border-r border-black p-8">
              <SearchBar />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto">
              <button className="px-10 py-6 sm:py-8 border-b sm:border-b-0 sm:border-r border-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                Date Range
              </button>
              <button className="px-10 py-6 sm:py-8 border-b sm:border-b-0 sm:border-r border-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                Geography
              </button>
              <div className="px-10 py-6 sm:py-8 flex items-center gap-4 text-xs font-black uppercase tracking-widest bg-gray-50">
                <span className="text-gray-400">Layout:</span>
                <button className="text-black">Grid</button>
                <button className="text-gray-300 hover:text-black">Stack</button>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-sheet-grid min-h-screen p-6 md:p-8 animate-fade-in">
          {photos.length === 0 ? (
            <div className="max-w-screen-2xl mx-auto text-center py-20">
              <p className="text-gray-600 text-lg font-archive italic">
                No photos published yet.
              </p>
              <Link
                href="/"
                className="text-xs font-black uppercase tracking-widest hover:underline mt-6 inline-block"
              >
                Return to Journal
              </Link>
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto">
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

                        return (
                          <Link
                            key={photo.id}
                            href={`/photo/${photo.id}`}
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
                                src={`/api/${photo.thumbnail_path}`}
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

              {totalPages > 1 && (
                <div className="mt-24 mb-20 flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    {currentPage > 1 ? (
                      <Link
                        href={`/archive?page=${currentPage - 1}`}
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
                      href="/archive?page=1"
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
                          href={`/archive?page=${page}`}
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
                        href={`/archive?page=${totalPages}`}
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
                        href={`/archive?page=${currentPage + 1}`}
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
        </section>
      </main>

      <footer className="border-t border-black p-8 bg-white">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
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
        </div>
      </footer>
    </div>
  );
}
