import Link from 'next/link';
import { getLatestPhoto, getJourneyStats } from '@/lib/api';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import PhotoJournal from '@/components/photo/PhotoJournal';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const photo = await getLatestPhoto();
  const stats = await getJourneyStats();

  if (!photo) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SectionTopBar
          title="Journal"
          theme="dark"
          activeHref="/"
          className="border-b border-white/10"
        />
        <PageContainer className="py-20 flex flex-1 items-center justify-center">
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
        </PageContainer>
      </div>
    );
  }

  return <PhotoJournal photo={photo} stats={stats} activeHref="/" />;
}
