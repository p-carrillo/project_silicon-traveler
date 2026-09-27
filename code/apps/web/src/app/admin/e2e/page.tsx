import { notFound } from 'next/navigation';
import { isE2EDevelopmentEnabled } from '@/lib/e2e';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';
import E2EPhotoBatch from '@/components/admin/E2EPhotoBatch';

export const metadata = { robots: { index: false, follow: false } };

export default function AdminE2EPage() {
  if (!isE2EDevelopmentEnabled()) notFound();
  const t = getTranslations(getServerLocale());
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">{t.admin.title}</p>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{t.admin.e2e.title}</h1>
      <div role="tablist" aria-label={t.admin.e2e.title} className="border-b border-zinc-200">
        <button type="button" role="tab" aria-selected="true" className="border-b-2 border-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-950">{t.admin.e2e.photosTab}</button>
      </div>
      <E2EPhotoBatch labels={t.admin.e2e} />
    </section>
  );
}
