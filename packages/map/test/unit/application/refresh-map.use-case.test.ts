import { describe, it, expect, vi } from 'vitest';
import { RefreshMapUseCase } from '../../../src/application/refresh-map.use-case';
import { MapState } from '../../../src/domain/map-state.entity';

describe('RefreshMapUseCase', () => {
  it('updates map state with latest photo id', async () => {
    const repo = {
      touchLastPhoto: vi.fn().mockResolvedValue(
        new MapState(1, { minLng: -10, minLat: -5, maxLng: 10, maxLat: 5 }, 2, 42, new Date())
      ),
    };

    const useCase = new RefreshMapUseCase(repo as any);
    const result = await useCase.execute(42);

    expect(repo.touchLastPhoto).toHaveBeenCalledWith(42);
    expect(result.lastPhotoId).toBe(42);
  });

  it('rejects invalid photo id', async () => {
    const repo = { touchLastPhoto: vi.fn() };
    const useCase = new RefreshMapUseCase(repo as any);

    await expect(useCase.execute(0)).rejects.toThrow('Invalid photo id');
  });
});
