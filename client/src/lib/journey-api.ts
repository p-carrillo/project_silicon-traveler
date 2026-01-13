export type Journey = {
  id: string;
  name: string;
  description?: string | null;
  start_date: string | null;
  timezone: string;
};

export type JourneyEntryLocation = {
  title: string;
  city: string | null;
  country: string | null;
};

export type JourneyEntry = {
  id: string;
  travel_date: string;
  image_url_full: string;
  image_url_web: string;
  image_url_thumb: string;
  text_body: string;
  location?: JourneyEntryLocation | null;
};

export type ApiResult<T> = {
  data: T | null;
  error?: string;
  status?: number;
};

const defaultApiUrl = "http://localhost:3001";

function resolveApiUrl(): string {
  return process.env.API_URL ?? defaultApiUrl;
}

export function getJourneyId(): string | null {
  return process.env.JOURNEY_ID ?? null;
}

async function requestJson<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  const apiUrl = resolveApiUrl();

  try {
    const response = await fetch(`${apiUrl}${path}`, options);

    if (!response.ok) {
      return {
        data: null,
        error: `HTTP ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { data: null, error: message };
  }
}

type JourneyResponse = {
  journey: Journey;
};

type JourneyEntryResponse = {
  entry: JourneyEntry;
};

type JourneyEntryListResponse = {
  entries: JourneyEntry[];
};

export async function fetchJourney(
  journeyId: string,
): Promise<ApiResult<Journey>> {
  const result = await requestJson<JourneyResponse>(`/journeys/${journeyId}`);

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  return { data: result.data.journey };
}

export async function fetchLatestEntry(
  journeyId: string,
): Promise<ApiResult<JourneyEntry>> {
  const result = await requestJson<JourneyEntryResponse>(
    `/journeys/${journeyId}/entries/latest`,
    { cache: "no-store" },
  );

  if (result.status === 404) {
    return { data: null };
  }

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  return { data: result.data.entry };
}

export async function fetchJourneyEntries(
  journeyId: string,
  options?: { month?: string; limit?: number; offset?: number },
): Promise<ApiResult<JourneyEntry[]>> {
  const params = new URLSearchParams();

  if (options?.month) {
    params.set("month", options.month);
  }
  if (typeof options?.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (typeof options?.offset === "number") {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const path = query
    ? `/journeys/${journeyId}/entries?${query}`
    : `/journeys/${journeyId}/entries`;

  const result = await requestJson<JourneyEntryListResponse>(path);

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  return { data: result.data.entries };
}

export async function fetchJourneyEntryByDate(
  journeyId: string,
  travelDate: string,
): Promise<ApiResult<JourneyEntry>> {
  const result = await requestJson<JourneyEntryResponse>(
    `/journeys/${journeyId}/entries/${travelDate}`,
  );

  if (result.status === 404) {
    return { data: null };
  }

  if (!result.data) {
    return { data: null, error: result.error, status: result.status };
  }

  return { data: result.data.entry };
}
