import type { AdminRoutePointOrder } from '@/types/admin';

const DEFAULT_ADMIN_PAGE_LIMIT = 10;
const DEFAULT_ADMIN_ORDER: AdminRoutePointOrder = 'id_desc';
const VALID_ORDERS: AdminRoutePointOrder[] = ['id_desc', 'id_asc'];

export interface AdminPaginationState {
  limit: number;
  offset: number;
  total: number;
  from: number;
  to: number;
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevOffset: number;
  nextOffset: number;
}

export interface AdminListFilters {
  status: string;
  city: string;
  order: AdminRoutePointOrder;
}

export function resolveAdminPageLimit(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ADMIN_PAGE_LIMIT;
  }
  return Math.floor(parsed);
}

export function resolveAdminPageOffset(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

export function resolveAdminListOrder(value: string | undefined): AdminRoutePointOrder {
  if (!value) {
    return DEFAULT_ADMIN_ORDER;
  }

  if (VALID_ORDERS.includes(value as AdminRoutePointOrder)) {
    return value as AdminRoutePointOrder;
  }

  return DEFAULT_ADMIN_ORDER;
}

export function computeAdminPagination(params: {
  total: number;
  limit: number;
  offset: number;
}): AdminPaginationState {
  const limit = params.limit > 0 ? Math.floor(params.limit) : DEFAULT_ADMIN_PAGE_LIMIT;
  const total = params.total > 0 ? Math.floor(params.total) : 0;
  const rawOffset = params.offset >= 0 ? Math.floor(params.offset) : 0;

  const maxOffset = total > 0 ? Math.floor((total - 1) / limit) * limit : 0;
  const offset = Math.min(rawOffset, maxOffset);

  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;
  const prevOffset = hasPrev ? offset - limit : 0;
  const nextOffset = hasNext ? offset + limit : maxOffset;
  const from = total === 0 ? 0 : offset + 1;
  const to = total === 0 ? 0 : Math.min(offset + limit, total);
  const page = total === 0 ? 1 : Math.floor(offset / limit) + 1;
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

  return {
    limit,
    offset,
    total,
    from,
    to,
    page,
    totalPages,
    hasPrev,
    hasNext,
    prevOffset,
    nextOffset,
  };
}

export function buildAdminListHref(params: {
  filters: AdminListFilters;
  limit: number;
  offset: number;
}): string {
  const search = new URLSearchParams();

  if (params.filters.status) {
    search.set('status', params.filters.status);
  }

  if (params.filters.city) {
    search.set('city', params.filters.city);
  }

  if (params.filters.order !== DEFAULT_ADMIN_ORDER) {
    search.set('order', params.filters.order);
  }

  search.set('limit', String(params.limit));

  if (params.offset > 0) {
    search.set('offset', String(params.offset));
  }

  const query = search.toString();
  return query ? `/admin?${query}` : '/admin';
}

export function buildAdminVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): number[] {
  if (totalPages <= 0) {
    return [1];
  }

  const visible = Math.max(1, Math.floor(maxVisible));
  if (totalPages <= visible) {
    return Array.from({ length: totalPages }, (_v, i) => i + 1);
  }

  const half = Math.floor(visible / 2);
  let start = currentPage - half;
  let end = start + visible - 1;

  if (start < 1) {
    start = 1;
    end = visible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = end - visible + 1;
  }

  return Array.from({ length: end - start + 1 }, (_v, i) => start + i);
}
