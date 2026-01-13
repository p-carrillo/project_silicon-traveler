import 'server-only';
import { cookies } from 'next/headers';

export type AdminApiResult<T> = {
  data: T | null;
  error?: string;
  status?: number;
};

export type AdminSession = {
  username: string;
};

export type PromptTemplate = {
  id: string;
  keyName: string;
  kind: 'image' | 'text';
  template: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromptTemplateListResponse = {
  templates: PromptTemplate[];
};

export type JourneySummary = {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed';
  start_date: string | null;
  timezone: string;
};

export type JourneyListResponse = {
  journeys: JourneySummary[];
};

export type JourneyStop = {
  id: string;
  title: string;
  city: string | null;
  country: string | null;
  description: string | null;
  sequence: number;
};

export type JourneyDetail = {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed';
  start_date: string | null;
  timezone: string;
  stops: JourneyStop[];
};

export type JourneyDetailResponse = {
  journey: JourneyDetail;
};

export type JourneyEntryResponse = {
  entry: {
    id: string;
    travel_date: string;
    image_url_full: string;
    image_url_web: string;
    image_url_thumb: string;
    text_body: string;
  };
};

const defaultApiUrl = 'http://localhost:3001';

export function resolveAdminApiUrl(): string {
  return process.env.API_URL ?? defaultApiUrl;
}

function buildAuthHeaders(): HeadersInit {
  const cookieHeader = cookies().toString();
  return cookieHeader ? { Cookie: cookieHeader } : {};
}

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<AdminApiResult<T>> {
  const apiUrl = resolveAdminApiUrl();
  const headers = new Headers(options.headers);
  const authHeaders = buildAuthHeaders();

  for (const [key, value] of Object.entries(authHeaders)) {
    headers.set(key, value);
  }

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers,
      cache: options.cache ?? 'no-store',
    });

    if (!response.ok) {
      return {
        data: null,
        error: `HTTP ${response.status}`,
        status: response.status,
      };
    }

    if (response.status === 204) {
      return { data: null };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return { data: null, error: message };
  }
}
