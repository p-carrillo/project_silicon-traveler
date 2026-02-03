import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import MapExplorer from '@/components/map/MapExplorer';

export const dynamic = 'force-dynamic';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title="Map"
        theme="light"
        activeHref="/map"
        className="border-b border-zinc-200 bg-zinc-100/95"
      />
      <PageContainer className="py-10">
        <MapExplorer />
      </PageContainer>
    </div>
  );
}
