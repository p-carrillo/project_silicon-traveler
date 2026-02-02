import { Photo, JourneyStats, RoutePoint } from '@/types';

// Server-side usa el nombre del contenedor, client-side usa localhost
const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.API_URL || 'http://api:3000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
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

export async function getLatestPhoto(): Promise<Photo | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/photos/latest`, {
      cache: 'no-store'
    });
    
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

export async function getPhotos(limit = 20, offset = 0): Promise<{
  photos: Photo[];
  pagination: { limit: number; offset: number; count: number };
}> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/photos?limit=${limit}&offset=${offset}`,
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
