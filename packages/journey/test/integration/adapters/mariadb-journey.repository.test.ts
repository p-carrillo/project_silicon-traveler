import { describe, it, expect } from 'vitest';

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const hasDbEnv = requiredEnv.every((key) => Boolean(process.env[key]));
const shouldRun = process.env.RUN_DB_TESTS === 'true' && hasDbEnv;
const dbTest = shouldRun ? it : it.skip;

describe('MariaDBJourneyRepository (integration)', () => {
  dbTest('creates and retrieves a journey', async () => {
    const { MariaDBJourneyRepository } = await import('../../../src/adapters/mariadb-journey.repository');
    const { Journey } = await import('../../../src/domain/journey.entity');
    const { pool } = await import('../../../../shared/src/database/pool');

    const repo = new MariaDBJourneyRepository();
    const journeyData = Journey.create('Integration Trip', { lat: 1, lng: 1 }, 'east');

    const created = await repo.create(journeyData);
    const fetched = await repo.findById(created.id);

    try {
      expect(fetched).not.toBeNull();
      expect(fetched?.name).toBe(created.name);
      expect(fetched?.originPoint).toEqual(created.originPoint);
      expect(fetched?.heading).toBe(created.heading);
    } finally {
      await pool.query('DELETE FROM journey WHERE id = ?', [created.id]);
      await pool.end();
    }
  });
});
