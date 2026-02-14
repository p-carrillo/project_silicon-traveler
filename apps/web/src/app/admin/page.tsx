import Link from 'next/link';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import PageContainer from '@/components/layout/PageContainer';
import SectionTopBar from '@/components/layout/SectionTopBar';
import { getAdminRoutePoints } from '@/lib/admin-api';
import {
  buildAdminListHref,
  buildAdminVisiblePages,
  computeAdminPagination,
  resolveAdminListOrder,
  resolveAdminPageLimit,
  resolveAdminPageOffset,
} from '@/lib/admin-pagination';
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

const ORDER_OPTIONS = [
  { value: 'id_desc', key: 'id_desc' as const },
  { value: 'id_asc', key: 'id_asc' as const },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    city?: string;
    order?: string;
    offset?: string;
    limit?: string;
    deleted?: string;
  };
}) {
  const locale = getServerLocale();
  const t = getTranslations(locale);

  const status = typeof searchParams?.status === 'string' ? searchParams.status : '';
  const city = typeof searchParams?.city === 'string' ? searchParams.city.trim() : '';
  const order = resolveAdminListOrder(searchParams?.order);
  const limit = resolveAdminPageLimit(searchParams?.limit);
  const offset = resolveAdminPageOffset(searchParams?.offset);
  const deleted = searchParams?.deleted === '1';

  const list = await getAdminRoutePoints({
    statuses: status || undefined,
    city: city || undefined,
    order,
    limit,
    offset,
  });
  const pagination = computeAdminPagination({
    total: list.pagination.total,
    limit: list.pagination.limit,
    offset: list.pagination.offset,
  });
  const filters = {
    status,
    city,
    order,
  };
  const prevHref = buildAdminListHref({
    filters,
    limit: pagination.limit,
    offset: pagination.prevOffset,
  });
  const nextHref = buildAdminListHref({
    filters,
    limit: pagination.limit,
    offset: pagination.nextOffset,
  });
  const visiblePages = buildAdminVisiblePages(pagination.page, pagination.totalPages);

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
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                {t.admin.filters.city}
                <input
                  name="city"
                  defaultValue={city}
                  placeholder={t.admin.filters.cityPlaceholder}
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                {t.admin.filters.order}
                <select
                  name="order"
                  defaultValue={order}
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
                >
                  {ORDER_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.value}>
                      {t.admin.order[opt.key]}
                    </option>
                  ))}
                </select>
              </label>
              <input type="hidden" name="limit" value={pagination.limit} />
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

          <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-zinc-700">
              {t.admin.pagination.summary(
                pagination.from,
                pagination.to,
                pagination.total,
                pagination.page,
                pagination.totalPages
              )}
            </div>
            <div className="flex items-center gap-2">
              {pagination.hasPrev ? (
                <Link
                  href={prevHref}
                  className="inline-flex h-9 min-w-24 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                >
                  {t.admin.pagination.prev}
                </Link>
              ) : (
                <span className="inline-flex h-9 min-w-24 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-semibold text-zinc-400">
                  {t.admin.pagination.prev}
                </span>
              )}
              {visiblePages.map((pageNumber) => {
                const pageHref = buildAdminListHref({
                  filters,
                  limit: pagination.limit,
                  offset: (pageNumber - 1) * pagination.limit,
                });

                if (pageNumber === pagination.page) {
                  return (
                    <span
                      key={pageNumber}
                      className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-zinc-900 bg-zinc-900 px-3 text-sm font-semibold text-white"
                    >
                      {pageNumber}
                    </span>
                  );
                }

                return (
                  <Link
                    key={pageNumber}
                    href={pageHref}
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                  >
                    {pageNumber}
                  </Link>
                );
              })}
              {pagination.hasNext ? (
                <Link
                  href={nextHref}
                  className="inline-flex h-9 min-w-24 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-900"
                >
                  {t.admin.pagination.next}
                </Link>
              ) : (
                <span className="inline-flex h-9 min-w-24 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 px-3 text-sm font-semibold text-zinc-400">
                  {t.admin.pagination.next}
                </span>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
