import type {
  AdminRoutePoint,
  AdminRoutePointListResponse,
  AdminRoutePointOrder,
  AdminRoutePointUpdateInput,
} from '@/types/admin';

const API_BASE_URL = process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;

async function adminFetch(path: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(options.headers || {});
    if (API_KEY) {
      headers.set('Authorization', `Bearer ${API_KEY}`);
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getAdminRoutePoints(params: {
  statuses?: string;
  city?: string;
  order?: AdminRoutePointOrder;
  limit?: number;
  offset?: number;
}): Promise<AdminRoutePointListResponse> {
  const search = new URLSearchParams();
  if (params.statuses) search.set('statuses', params.statuses);
  if (params.city) search.set('city', params.city);
  if (params.order) search.set('order', params.order);
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.offset !== undefined) search.set('offset', String(params.offset));

  const res = await adminFetch(`/api/admin/route-points?${search.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch admin route points');
  }
  return (await res.json()) as AdminRoutePointListResponse;
}

export async function getAdminRoutePoint(id: number): Promise<AdminRoutePoint> {
  const res = await adminFetch(`/api/admin/route-points/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Route point not found');
    throw new Error('Failed to fetch admin route point');
  }
  return (await res.json()) as AdminRoutePoint;
}

export async function createAdminRoutePoint(input: {
  place_name?: string | null;
  country?: string | null;
  region?: string | null;
  coordinates: { lat: number; lng: number };
}): Promise<{ id: number }> {
  const res = await adminFetch('/api/admin/route-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error('Failed to create route point');
  }
  return (await res.json()) as { id: number };
}

export async function updateAdminRoutePoint(id: number, input: AdminRoutePointUpdateInput): Promise<void> {
  const res = await adminFetch(`/api/admin/route-points/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    try {
      const payload = (await res.json()) as { error?: string };
      if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
        throw new Error(payload.error);
      }
    } catch (error) {
      if (error instanceof Error && error.message.trim().length > 0) {
        throw error;
      }
    }
    throw new Error('Failed to update route point');
  }
}

export async function deleteAdminRoutePoint(id: number): Promise<void> {
  const res = await adminFetch(`/api/admin/route-points/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete route point');
  }
}

export async function uploadAdminRoutePointPhoto(id: number, jpeg: ArrayBuffer): Promise<{
  image_path: string;
  thumbnail_path: string | null;
  hero_thumbnail_path: string | null;
}> {
  const res = await adminFetch(`/api/admin/route-points/${id}/photo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: jpeg,
  });

  if (!res.ok) {
    throw new Error('Failed to upload route point photo');
  }
  return (await res.json()) as {
    image_path: string;
    thumbnail_path: string | null;
    hero_thumbnail_path: string | null;
  };
}
