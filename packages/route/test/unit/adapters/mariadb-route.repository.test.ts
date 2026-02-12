import { afterEach, describe, expect, it, vi } from 'vitest';
import { pool } from '@silicon-traveler/shared';
import { MariaDBRouteRepository } from '../../../src/adapters/mariadb-route.repository';

describe('MariaDBRouteRepository (unit)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('coerces insertId BigInt to number on create', async () => {
    const release = vi.fn();
    const query = vi.fn().mockResolvedValue({ insertId: BigInt(42) });
    vi.spyOn(pool, 'getConnection').mockResolvedValue({ query, release } as any);

    const repo = new MariaDBRouteRepository();

    const created = await repo.create({
      journeyId: 1,
      sequence: 12,
      placeName: 'Bilbao',
      coordinates: { lat: 43.26, lng: -2.93 },
      country: 'Spain',
      region: 'Basque Country',
      isFferryCrossing: false,
      distanceFromPrevious: 24.5,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      status: 'pending',
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    });

    expect(created.id).toBe(42);
    expect(typeof created.id).toBe('number');
    expect(release).toHaveBeenCalledTimes(1);
  });
});
