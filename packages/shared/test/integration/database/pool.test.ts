import { describe, it, expect } from 'vitest';

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const hasDbEnv = requiredEnv.every((key) => Boolean(process.env[key]));
const shouldRun = process.env.RUN_DB_TESTS === 'true' && hasDbEnv;

const dbTest = shouldRun ? it : it.skip;

describe('database pool (integration)', () => {
  dbTest('connects and runs a simple query', async () => {
    const { pool } = await import('../../../src/database/pool');
    const conn = await pool.getConnection();

    try {
      const rows = await conn.query('SELECT 1 as ok');
      expect(rows[0].ok).toBe(1);
    } finally {
      conn.release();
      await pool.end();
    }
  });
});
