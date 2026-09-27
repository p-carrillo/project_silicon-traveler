export interface BoundingBoxParam {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export function parseBboxParam(raw: unknown): {
  value: BoundingBoxParam | null;
  error?: string;
} {
  if (raw === undefined || raw === null || raw === '') {
    return { value: null, error: 'bbox is required' };
  }

  if (typeof raw !== 'string') {
    return { value: null, error: 'bbox must be a comma-separated string' };
  }

  const parts = raw.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    return { value: null, error: 'bbox must have 4 numeric values' };
  }

  const [minLng, minLat, maxLng, maxLat] = parts;

  if (minLng >= maxLng || minLat >= maxLat) {
    return { value: null, error: 'bbox min values must be less than max values' };
  }

  if (minLng < -180 || maxLng > 180) {
    return { value: null, error: 'bbox longitude must be between -180 and 180' };
  }

  if (minLat < -90 || maxLat > 90) {
    return { value: null, error: 'bbox latitude must be between -90 and 90' };
  }

  return {
    value: {
      minLng,
      minLat,
      maxLng,
      maxLat,
    },
  };
}

export function parseLimitParam(raw: unknown, fallback: number): {
  value: number;
  error?: string;
} {
  if (raw === undefined || raw === null || raw === '') {
    return { value: fallback };
  }

  const limit = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(limit) || Number.isNaN(limit)) {
    return { value: fallback, error: 'limit must be a number' };
  }

  if (limit < 1 || limit > 500) {
    return { value: fallback, error: 'limit must be between 1 and 500' };
  }

  return { value: limit };
}

export function parseZoomParam(raw: unknown): {
  value: number | null;
  error?: string;
} {
  if (raw === undefined || raw === null || raw === '') {
    return { value: null };
  }

  const zoom = typeof raw === 'string' ? Number(raw) : Number(raw);
  if (!Number.isFinite(zoom) || Number.isNaN(zoom)) {
    return { value: null, error: 'zoom must be a number' };
  }

  if (zoom < 1 || zoom > 12) {
    return { value: null, error: 'zoom must be between 1 and 12' };
  }

  return { value: zoom };
}
