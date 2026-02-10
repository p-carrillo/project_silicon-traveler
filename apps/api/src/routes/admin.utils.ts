import { Point } from '@silicon-traveler/shared';
import type { RouteStatus } from '@silicon-traveler/route';

const ROUTE_STATUSES: RouteStatus[] = [
  'pending',
  'researched',
  'content_generated',
  'image_ready',
  'published',
  'failed',
];

export function parsePositiveInt(
  value: unknown,
  fallback: number,
  { min, max }: { min: number; max: number }
): { value: number } | { error: string } {
  if (value === undefined || value === null || value === '') {
    return { value: fallback };
  }

  const n = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n) || !Number.isInteger(n)) {
    return { error: 'Value must be an integer' };
  }
  if (n < min || n > max) {
    return { error: `Value must be between ${min} and ${max}` };
  }
  return { value: n };
}

export function parseOffsetInt(
  value: unknown,
  fallback: number
): { value: number } | { error: string } {
  if (value === undefined || value === null || value === '') {
    return { value: fallback };
  }

  const n = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n) || !Number.isInteger(n) || n < 0) {
    return { error: 'Offset must be a non-negative integer' };
  }
  return { value: n };
}

export function parseStatusesParam(value: unknown): { value: RouteStatus[] | undefined } | { error: string } {
  if (value === undefined || value === null || value === '') {
    return { value: undefined };
  }

  if (Array.isArray(value)) {
    const statuses: string[] = value.map((v) => String(v));
    return validateStatuses(statuses);
  }

  const raw = String(value);
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return validateStatuses(parts);
}

function validateStatuses(values: string[]): { value: RouteStatus[] } | { error: string } {
  const normalized = values.map((s) => s.trim()) as string[];
  const unique = Array.from(new Set(normalized));

  const invalid = unique.filter((s) => !ROUTE_STATUSES.includes(s as RouteStatus));
  if (invalid.length) {
    return { error: `Invalid status: ${invalid[0]}` };
  }

  return { value: unique as RouteStatus[] };
}

export function parsePoint(value: unknown): { value: Point } | { error: string } {
  if (!value || typeof value !== 'object') {
    return { error: 'coordinates is required' };
  }

  const record = value as Record<string, unknown>;
  const lng = Number(record.lng);
  const lat = Number(record.lat);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return { error: 'coordinates must contain numeric lat and lng' };
  }

  if (lat < -90 || lat > 90) {
    return { error: 'latitude must be between -90 and 90' };
  }

  if (lng < -180 || lng > 180) {
    return { error: 'longitude must be between -180 and 180' };
  }

  return { value: { lat, lng } };
}
