export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export const DEFAULT_BOUNDING_BOX: BoundingBox = {
  minLng: -180,
  minLat: -90,
  maxLng: 180,
  maxLat: 90,
};

export function clampBoundingBox(bbox: BoundingBox): BoundingBox {
  const minLng = Math.max(-180, Math.min(180, bbox.minLng));
  const maxLng = Math.max(-180, Math.min(180, bbox.maxLng));
  const minLat = Math.max(-90, Math.min(90, bbox.minLat));
  const maxLat = Math.max(-90, Math.min(90, bbox.maxLat));

  return { minLng, minLat, maxLng, maxLat };
}

export function isValidBoundingBox(bbox: BoundingBox): boolean {
  return (
    Number.isFinite(bbox.minLng) &&
    Number.isFinite(bbox.minLat) &&
    Number.isFinite(bbox.maxLng) &&
    Number.isFinite(bbox.maxLat) &&
    bbox.minLng < bbox.maxLng &&
    bbox.minLat < bbox.maxLat &&
    bbox.minLng >= -180 &&
    bbox.maxLng <= 180 &&
    bbox.minLat >= -90 &&
    bbox.maxLat <= 90
  );
}
