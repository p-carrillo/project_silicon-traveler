import { describe, it, expect } from 'vitest';

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const hasDbEnv = requiredEnv.every((key) => Boolean(process.env[key]));
const shouldRun = process.env.RUN_DB_TESTS === 'true' && hasDbEnv;
const dbTest = shouldRun ? it : it.skip;

describe('MariaDBRouteRepository (integration)', () => {
  dbTest('creates and retrieves a route point', async () => {
    const { MariaDBRouteRepository } = await import('../../../src/adapters/mariadb-route.repository');
    const { pool } = await import('../../../../shared/src/database/pool');
    const { pointToWKT } = await import('../../../../shared/src/database/geographic');

    const origin = { lat: 10, lng: 10 };
    const now = new Date();

    const journeyResult = await pool.query(
      `INSERT INTO journey (name, origin_point, current_position, heading, started_at)
       VALUES (?, ST_GeomFromText(?, 4326), ST_GeomFromText(?, 4326), ?, ?)`,
      ['Route Test Journey', pointToWKT(origin), pointToWKT(origin), 'east', now]
    );

    const journeyId = journeyResult.insertId as number;
    const repo = new MariaDBRouteRepository();

    const created = await repo.create({
      journeyId,
      sequence: 1,
      placeName: 'Test Place',
      coordinates: { lat: 11, lng: 11 },
      country: 'Test Country',
      region: 'Test Region',
      isFferryCrossing: false,
      travelMode: 'land',
      distanceFromPrevious: 12.34,
      osmData: { foo: 'bar' },
      researchSummary: 'Summary',
      imagePrompt: 'Prompt',
      narrativePrompt: 'Narrative',
      cameraMetadata: { camera: 'Test', lens: 'Test', iso: 100, shutterSpeed: '1/100', aperture: 'f/2.8' },
      status: 'pending',
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    });

    const fetched = await repo.findById(created.id);

    try {
      expect(fetched).not.toBeNull();
      expect(fetched?.journeyId).toBe(journeyId);
      expect(fetched?.placeName).toBe('Test Place');
      expect(fetched?.coordinates).toEqual({ lat: 11, lng: 11 });
      expect(fetched?.travelMode).toBe('land');
    } finally {
      await pool.query('DELETE FROM route_points WHERE id = ?', [created.id]);
      await pool.query('DELETE FROM journey WHERE id = ?', [journeyId]);
      await pool.end();
    }
  });

  dbTest('counts route points by status as number', async () => {
    const { MariaDBRouteRepository } = await import('../../../src/adapters/mariadb-route.repository');
    const { pool } = await import('../../../../shared/src/database/pool');
    const { pointToWKT } = await import('../../../../shared/src/database/geographic');

    const origin = { lat: 20, lng: 20 };
    const now = new Date();

    const journeyResult = await pool.query(
      `INSERT INTO journey (name, origin_point, current_position, heading, started_at)
       VALUES (?, ST_GeomFromText(?, 4326), ST_GeomFromText(?, 4326), ?, ?)`,
      ['Route Count Journey', pointToWKT(origin), pointToWKT(origin), 'east', now]
    );

    const journeyId = journeyResult.insertId as number;
    const repo = new MariaDBRouteRepository();

    const createdIds: number[] = [];
    try {
      const first = await repo.create({
        journeyId,
        sequence: 1,
        placeName: 'Count Place 1',
        coordinates: { lat: 21, lng: 21 },
        country: 'Test Country',
        region: 'Test Region',
        isFferryCrossing: false,
        travelMode: 'land',
        distanceFromPrevious: 5,
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
      createdIds.push(first.id);

      const second = await repo.create({
        journeyId,
        sequence: 2,
        placeName: 'Count Place 2',
        coordinates: { lat: 22, lng: 22 },
        country: 'Test Country',
        region: 'Test Region',
        isFferryCrossing: false,
        travelMode: 'land',
        distanceFromPrevious: 5,
        osmData: null,
        researchSummary: null,
        imagePrompt: null,
        narrativePrompt: null,
        cameraMetadata: null,
        status: 'content_generated',
        errorMessage: null,
        imagePath: null,
        thumbnailPath: null,
        publishedAt: null,
      });
      createdIds.push(second.id);

      const count = await repo.countByStatuses(['pending', 'content_generated']);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(2);
    } finally {
      if (createdIds.length > 0) {
        await pool.query('DELETE FROM route_points WHERE id IN (?)', [createdIds]);
      }
      await pool.query('DELETE FROM journey WHERE id = ?', [journeyId]);
      await pool.end();
    }
  });
});
