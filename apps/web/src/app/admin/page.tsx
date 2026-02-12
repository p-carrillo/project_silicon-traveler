import Link from 'next/link';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import { getAdminRoutePoints } from '@/lib/admin-api';
import { getServerLocale } from '@/lib/i18n/server';
import { getTranslations } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';
export const metadata = {
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = [
  { value: '', key: 'all' as const },
  { value: 'pending', key: 'pending' as const },
  { value: 'researched', key: 'researched' as const },
  { value: 'content_generated', key: 'content_generated' as const },
  { value: 'image_ready', key: 'image_ready' as const },
  { value: 'published', key: 'published' as const },
  { value: 'failed', key: 'failed' as const },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { status?: string; offset?: string; limit?: string; deleted?: string };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);

  const status = typeof searchParams?.status === 'string' ? searchParams.status : '';
  const limit = typeof searchParams?.limit === 'string' ? Number(searchParams.limit) : 100;
  const offset = typeof searchParams?.offset === 'string' ? Number(searchParams.offset) : 0;
  const deleted = searchParams?.deleted === '1';

  const list = await getAdminRoutePoints({
    statuses: status || undefined,
    limit: Number.isFinite(limit) ? limit : 100,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SectionTopBar
        title={t.admin.title}
        theme="light"
        activeHref="/"
        className="border-b border-zinc-200 bg-zinc-100/95"
        navLabels={t.nav}
      />
      <PageContainer className="py-6 md:py-10">
        <div className="flex flex-col gap-6">
          {deleted ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {t.admin.success.deleted}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <form className="flex items-end gap-3" method="get" action="/admin">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                {t.admin.filters.status}
                <select
                  name="status"
                  defaultValue={status}
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.value}>
                      {t.admin.status[opt.key]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white"
              >
                {t.admin.actions.apply}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/route-points/new"
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900"
              >
                {t.admin.actions.addRoutePoint}
              </Link>
              <AdminLogoutButton label={t.admin.actions.logout} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.2em] text-zinc-600">
                <tr>
                  <th className="px-4 py-3">{t.admin.table.sequence}</th>
                  <th className="px-4 py-3">{t.admin.table.status}</th>
                  <th className="px-4 py-3">{t.admin.table.city}</th>
                  <th className="px-4 py-3">{t.admin.table.country}</th>
                  <th className="px-4 py-3">{t.admin.table.updated}</th>
                  <th className="px-4 py-3">{t.admin.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {list.route_points.map((rp) => (
                  <tr key={rp.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700">{rp.sequence}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
                        {rp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{rp.place_name || t.admin.fallback.unknown}</td>
                    <td className="px-4 py-3">{rp.country || t.admin.fallback.unknown}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                      {new Date(rp.updated_at).toISOString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/route-points/${rp.id}`}
                        className="text-sm font-semibold text-zinc-900 underline underline-offset-4"
                      >
                        {t.admin.actions.edit}
                      </Link>
                    </td>
                  </tr>
                ))}
                {list.route_points.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-sm text-zinc-600" colSpan={6}>
                      {t.admin.empty}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
