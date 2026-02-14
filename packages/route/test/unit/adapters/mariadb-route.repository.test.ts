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
      travelMode: 'land',
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
    expect(created.travelMode).toBe('land');
    expect(typeof created.id).toBe('number');
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('applies city filter and id sort when listing route points', async () => {
    const release = vi.fn();
    const query = vi.fn().mockResolvedValue([]);
    vi.spyOn(pool, 'getConnection').mockResolvedValue({ query, release } as any);

    const repo = new MariaDBRouteRepository();

    await repo.findByJourney(1, {
      statuses: ['pending'],
      cityQuery: 'Bilbao',
      order: 'id_asc',
      limit: 10,
      offset: 20,
    });

    expect(query).toHaveBeenCalledTimes(1);
    const sql = String(query.mock.calls[0][0]);
    const params = query.mock.calls[0][1] as unknown[];

    expect(sql).toContain('LOWER(COALESCE(place_name, \'\')) LIKE ?');
    expect(sql).toContain('ORDER BY id ASC');
    expect(params).toEqual([1, 'pending', '%bilbao%', 10, 20]);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('applies city filter when counting route points', async () => {
    const release = vi.fn();
    const query = vi.fn().mockResolvedValue([{ count: 2 }]);
    vi.spyOn(pool, 'getConnection').mockResolvedValue({ query, release } as any);

    const repo = new MariaDBRouteRepository();

    const count = await repo.countByJourney(1, ['pending'], 'Bilbao');

    expect(count).toBe(2);
    const sql = String(query.mock.calls[0][0]);
    const params = query.mock.calls[0][1] as unknown[];

    expect(sql).toContain('LOWER(COALESCE(place_name, \'\')) LIKE ?');
    expect(params).toEqual([1, 'pending', '%bilbao%']);
    expect(release).toHaveBeenCalledTimes(1);
  });
});
