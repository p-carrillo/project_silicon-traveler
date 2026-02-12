import { afterEach, describe, expect, it, vi } from 'vitest';
import { pool, runInTransaction } from '../../../src/database/pool';

describe('runInTransaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('commits and releases connection on success', async () => {
    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn().mockResolvedValue([{ ok: 1 }]),
    };

    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const result = await runInTransaction(async (conn) => {
      await conn.query('SELECT 1');
      return 42;
    });

    expect(result).toBe(42);
    expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it('rolls back and releases connection when work throws', async () => {
    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };

    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    await expect(
      runInTransaction(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });
});
