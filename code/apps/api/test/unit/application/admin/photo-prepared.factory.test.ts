import { describe, expect, it } from 'vitest';
import { RoutePoint } from '@silicon-traveler/route';
import { buildPreparedPhotoFromRoutePoint } from '../../../../src/application/admin/photo-prepared.factory';

function createRoutePoint(cameraMetadata: unknown): RoutePoint {
  return new RoutePoint(
    10,
    1,
    1,
    'Madrid',
    { lat: 40.4168, lng: -3.7038 },
    'Spain',
    'Community of Madrid',
    null,
    null,
    null,
    'Prompt',
    null,
    'Narrative',
    cameraMetadata,
    'image_ready',
    null,
    '/images/2026/02/12/10.jpg',
    '/images/2026/02/12/10_grid.jpg',
    new Date('2026-02-12T00:00:00Z'),
    null,
    new Date('2026-02-12T00:00:00Z')
  );
}

describe('buildPreparedPhotoFromRoutePoint', () => {
  it('uses complete camera metadata from the route point', () => {
    const result = buildPreparedPhotoFromRoutePoint(
      createRoutePoint({ camera: 'Leica M11', lens: '50mm', iso: 400, shutterSpeed: '1/125', aperture: 'f/2.8' })
    );

    expect(result).toMatchObject({ camera: 'Leica M11', lens: '50mm', iso: 400, shutterSpeed: '1/125', aperture: 'f/2.8' });
  });

  it('uses defaults when persisted camera metadata is malformed', () => {
    const result = buildPreparedPhotoFromRoutePoint(createRoutePoint({ camera: 'Canon AE-1' }));

    expect(result).toMatchObject({ camera: 'Leica M11', lens: '50mm', iso: 800, shutterSpeed: '1/125', aperture: 'f/2.8' });
  });
});
