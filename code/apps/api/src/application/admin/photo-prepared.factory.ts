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

export function deriveThumbnailPath(relativeImagePath: string, suffix: string): string {
  const lastDot = relativeImagePath.lastIndexOf('.');
  if (lastDot === -1) {
    return `${relativeImagePath}${suffix}`;
  }

  return `${relativeImagePath.substring(0, lastDot)}${suffix}${relativeImagePath.substring(lastDot)}`;
}

export function buildPreparedPhotoFromRoutePoint(routePoint: RoutePoint): PreparedPhotoFromRoutePoint {
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
    camera: routePoint.cameraMetadata?.camera || 'Leica M11',
    lens: routePoint.cameraMetadata?.lens || '35mm f/1.4',
    iso: routePoint.cameraMetadata?.iso || 800,
    shutterSpeed: routePoint.cameraMetadata?.shutterSpeed || '1/125',
    aperture: routePoint.cameraMetadata?.aperture || 'f/2.8',
    revisedPrompt: null,
  };
}
