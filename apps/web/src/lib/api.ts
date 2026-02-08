import { Photo, JourneyStats, RoutePoint, MapState, MapPin } from '@/types';

// Server-side calls the internal API container directly.
// Client-side uses relative URLs routed through Next.js API proxy routes
// (see src/app/api/*/[...path]/route.ts) so the browser never needs
// to know the API key or the internal container address.
const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.API_URL || 'http://api:3000')
  : '';
const API_KEY = process.env.API_KEY;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const headers = new Headers(options.headers || {});
    if (API_KEY) {
      headers.set('Authorization', `Bearer ${API_KEY}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getLatestPhoto(locale?: string): Promise<Photo | null> {
  try {
    const params = new URLSearchParams();
    if (locale) params.append('lang', locale);

    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/photos/latest${params.toString() ? `?${params.toString()}` : ''}`,
      {
        cache: 'no-store'
      }
    );
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch latest photo');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching latest photo:', error);
    return null;
  }
}

export async function getPhotos(
  limit = 20,
  offset = 0,
  query?: string,
  dateRange?: { startDate?: string; endDate?: string },
  locale?: string
): Promise<{
  photos: Photo[];
  pagination: { limit: number; offset: number; count: number };
}> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const normalizedQuery = query?.trim();
    if (normalizedQuery) params.append('q', normalizedQuery);
    if (dateRange?.startDate) params.append('start_date', dateRange.startDate);
    if (dateRange?.endDate) params.append('end_date', dateRange.endDate);
    if (locale) params.append('lang', locale);

    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/photos?${params.toString()}`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) throw new Error('Failed to fetch photos');
    
    return res.json();
  } catch (error) {
    console.error('Error fetching photos:', error);
    return { photos: [], pagination: { limit, offset, count: 0 } };
  }
}

export async function getJourneyStats(): Promise<JourneyStats | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/journey/stats`, {
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Failed to fetch journey stats');
    
    return res.json();
  } catch (error) {
    console.error('Error fetching journey stats:', error);
    return null;
  }
}

export async function getRoutePoints(
  status?: string,
  limit = 100,
  offset = 0
): Promise<{
  route_points: RoutePoint[];
  pagination: { limit: number; offset: number; count: number };
}> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (status) params.append('status', status);
    
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/journey/route?${params.toString()}`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) throw new Error('Failed to fetch route points');
    
    return res.json();
  } catch (error) {
    console.error('Error fetching route points:', error);
    return { route_points: [], pagination: { limit, offset, count: 0 } };
  }
}

export async function getMapState(): Promise<MapState | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/map/state`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch map state');

    return res.json();
  } catch (error) {
    console.error('Error fetching map state:', error);
    return null;
  }
}

export async function saveMapState(
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number },
  zoom: number
): Promise<MapState | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/map/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bbox, zoom }),
    });

    if (!res.ok) throw new Error('Failed to save map state');

    return res.json();
  } catch (error) {
    console.error('Error saving map state:', error);
    return null;
  }
}

export async function getMapPins(
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number },
  limit = 200,
  query?: string,
  locale?: string
): Promise<{ pins: MapPin[] }> {
  try {
    const params = new URLSearchParams({
      bbox: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`,
      limit: limit.toString(),
    });
    if (query?.trim()) params.append('q', query.trim());
    if (locale) params.append('lang', locale);

    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/map/pins?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!res.ok) throw new Error('Failed to fetch map pins');

    return res.json();
  } catch (error) {
    console.error('Error fetching map pins:', error);
    return { pins: [] };
  }
}
