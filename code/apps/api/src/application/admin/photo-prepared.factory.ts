import type { RoutePoint } from '@silicon-traveler/route';

export interface PreparedPhotoFromRoutePoint {
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  narrative: string;
  imagePrompt: string;
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  revisedPrompt: null;
}

interface CameraMetadata {
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
}

function isCameraMetadata(value: unknown): value is CameraMetadata {
  if (typeof value !== 'object' || value === null) return false;

  const metadata = value as Record<string, unknown>;
  return (
    typeof metadata.camera === 'string' &&
    typeof metadata.lens === 'string' &&
    typeof metadata.iso === 'number' &&
    typeof metadata.shutterSpeed === 'string' &&
    typeof metadata.aperture === 'string'
  );
}

export function deriveThumbnailPath(relativeImagePath: string, suffix: string): string {
  const lastDot = relativeImagePath.lastIndexOf('.');
  if (lastDot === -1) {
    return `${relativeImagePath}${suffix}`;
  }

  return `${relativeImagePath.substring(0, lastDot)}${suffix}${relativeImagePath.substring(lastDot)}`;
}

export function buildPreparedPhotoFromRoutePoint(routePoint: RoutePoint): PreparedPhotoFromRoutePoint {
  const cameraMetadata = isCameraMetadata(routePoint.cameraMetadata) ? routePoint.cameraMetadata : null;
  const heroThumbnailUrl =
    routePoint.thumbnailPath && routePoint.thumbnailPath.includes('_grid')
      ? routePoint.thumbnailPath.replace('_grid', '_hero')
      : routePoint.imagePath
        ? deriveThumbnailPath(routePoint.imagePath, '_hero')
        : '/images/default_hero.jpg';

  return {
    imageUrl: routePoint.imagePath ?? '/images/default.jpg',
    gridThumbnailUrl: routePoint.thumbnailPath ?? '/images/default_grid.jpg',
    heroThumbnailUrl,
    narrative: routePoint.narrativePrompt || 'Another day on the road.',
    imagePrompt: routePoint.imagePrompt || '',
    camera: cameraMetadata?.camera || 'Leica M11',
    lens: cameraMetadata?.lens || '50mm',
    iso: cameraMetadata?.iso || 800,
    shutterSpeed: cameraMetadata?.shutterSpeed || '1/125',
    aperture: cameraMetadata?.aperture || 'f/2.8',
    revisedPrompt: null,
  };
}
