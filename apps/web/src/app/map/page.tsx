import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import MapExplorer from '@/components/map/MapExplorer';
import { getLatestPhoto } from '@/lib/api';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const locale = getServerLocale();
  const t = getTranslations(locale);
  const latestPhoto = await getLatestPhoto(locale);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title={t.map.title}
        theme="light"
        activeHref="/map"
        className="border-b border-zinc-200 bg-zinc-100/95"
        navLabels={t.nav}
      />
      <PageContainer className="py-2 md:py-10">
        <MapExplorer locale={locale} latestPhoto={latestPhoto} />
      </PageContainer>
    </div>
  );
}
