import type { AdminRouteStatus } from '@/types/admin';

export function normalizeOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function parseCoordinateInput(value: FormDataEntryValue | null): number {
  if (typeof value !== 'string') {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return Number.NaN;
  }

  return Number(trimmed.replace(',', '.'));
}

export function resolvePublishStatus(currentStatus: AdminRouteStatus, isPublished: boolean): AdminRouteStatus {
  if (isPublished) return 'published';
  if (currentStatus === 'published') return 'image_ready';
  return currentStatus;
}
