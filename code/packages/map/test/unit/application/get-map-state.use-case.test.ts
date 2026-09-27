import { describe, it, expect, vi } from 'vitest';
import { GetMapStateUseCase } from '../../../src/application/get-map-state.use-case';
import { MapState } from '../../../src/domain/map-state.entity';

describe('GetMapStateUseCase', () => {
  it('returns repository state when available', async () => {
    const state = new MapState(
      1,
      { minLng: -10, minLat: -5, maxLng: 10, maxLat: 5 },
      2,
      12,
      new Date('2026-02-03T00:00:00Z')
    );
    const repo = { get: vi.fn().mockResolvedValue(state) };
    const useCase = new GetMapStateUseCase(repo as any);

    const result = await useCase.execute();

    expect(result).toBe(state);
  });

  it('returns default when repository is empty', async () => {
    const repo = { get: vi.fn().mockResolvedValue(null) };
    const useCase = new GetMapStateUseCase(repo as any);

    const result = await useCase.execute();

    expect(result.bbox.minLng).toBe(-180);
    expect(result.zoom).toBeGreaterThan(0);
  });
});
