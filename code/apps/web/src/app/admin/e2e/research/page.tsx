import { notFound } from 'next/navigation';
import E2EPlaceResearch from '@/components/admin/E2EPlaceResearch';
import { isE2EDevelopmentEnabled } from '@/lib/e2e';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const metadata = { robots: { index: false, follow: false } };

export default function AdminE2EResearchPage() {
  if (!isE2EDevelopmentEnabled()) notFound();
  const locale = getServerLocale();
  const t = getTranslations(locale);
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">{t.admin.title}</p>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{t.admin.e2e.title}</h1>
      <E2EPlaceResearch labels={{
        researchTitle: t.admin.e2e.researchTitle,
        researchDescription: t.admin.e2e.researchDescription,
        location: t.admin.e2e.location,
        locationPlaceholder: t.admin.e2e.locationPlaceholder,
        randomLocation: t.admin.e2e.randomLocation,
        investigate: t.admin.e2e.investigate,
        researching: t.admin.e2e.researching,
        geocoding: t.admin.geocode.calculating,
        geocodeNotFound: t.admin.geocode.errors.notFound,
        geocodeFailed: t.admin.geocode.errors.failed,
        coordinates: t.admin.e2e.coordinates,
        queryTitle: t.admin.e2e.queryTitle,
        errorTitle: t.admin.e2e.errorTitle,
        geocodeStage: t.admin.e2e.geocodeStage,
        wikipediaStage: t.admin.e2e.wikipediaStage,
        executionStage: t.admin.e2e.executionStage,
        completed: t.admin.e2e.completed,
        sources: t.admin.e2e.sources,
        sourceTextTitle: t.admin.e2e.sourceTextTitle,
        sourceTextMissing: t.admin.e2e.sourceTextMissing,
        pageContentTitle: t.admin.e2e.pageContentTitle,
        summaryStage: t.admin.e2e.summaryStage,
        llmSummaryTitle: t.admin.e2e.llmSummaryTitle,
        summaryFallbackTitle: t.admin.e2e.summaryFallbackTitle,
        noResults: t.admin.e2e.researchNoResults,
        noMatchesReason: t.admin.e2e.researchNoMatchesReason,
        noSummaryReason: t.admin.e2e.researchNoSummaryReason,
        error: t.admin.e2e.researchFailure,
      }} geocodingLanguage={locale === 'en' ? 'en' : 'es'} />
    </section>
  );
}
