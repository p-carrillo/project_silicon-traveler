import { describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { RoutePoint, type MariaDBRouteRepository } from '@silicon-traveler/route';
import { type PublishPhotoUseCase } from '@silicon-traveler/photo';
import { PublisherJob } from '../../src/jobs/publisher.job';

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

describe('PublisherJob', () => {
  it('uses camera defaults when a persisted route point has malformed metadata', async () => {
    const routeRepo = {
      findByStatus: vi.fn().mockResolvedValue([createRoutePoint({ camera: 'Canon AE-1' })]),
    } as unknown as MariaDBRouteRepository;
    const publishPhotoUseCase = {
      execute: vi.fn().mockResolvedValue(99),
    } as unknown as PublishPhotoUseCase;
    vi.spyOn(axios, 'post').mockResolvedValue({});

    const job = new PublisherJob(routeRepo, publishPhotoUseCase);
    await job.execute();

    expect(publishPhotoUseCase.execute).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ camera: 'Leica M11', lens: '50mm', iso: 800, shutterSpeed: '1/125', aperture: 'f/2.8' })
    );
  });
});
