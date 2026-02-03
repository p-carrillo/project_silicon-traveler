import { describe, it, expect, vi } from 'vitest';
import { SaveMapStateUseCase } from '../../../src/application/save-map-state.use-case';
import { MapState } from '../../../src/domain/map-state.entity';

const makeRepo = () => ({
  save: vi.fn().mockImplementation((input) =>
    Promise.resolve(new MapState(1, input.bbox, input.zoom, null, new Date('2026-02-03T00:00:00Z')))
  ),
  get: vi.fn(),
  touchLastPhoto: vi.fn(),
});

describe('SaveMapStateUseCase', () => {
  it('saves a valid map state', async () => {
    const repo = makeRepo();
    const useCase = new SaveMapStateUseCase(repo as any);

    const result = await useCase.execute({
      bbox: { minLng: -10, minLat: -5, maxLng: 10, maxLat: 5 },
      zoom: 2,
    });

    expect(result.bbox.minLng).toBe(-10);
    expect(result.zoom).toBe(2);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid bbox', async () => {
    const repo = makeRepo();
    const useCase = new SaveMapStateUseCase(repo as any);

    await expect(
      useCase.execute({
        bbox: { minLng: 10, minLat: 0, maxLng: -10, maxLat: 5 },
        zoom: 2,
      })
    ).rejects.toThrow('Invalid bounding box');
  });

  it('rejects invalid zoom', async () => {
    const repo = makeRepo();
    const useCase = new SaveMapStateUseCase(repo as any);

    await expect(
      useCase.execute({
        bbox: { minLng: -10, minLat: -5, maxLng: 10, maxLat: 5 },
        zoom: 20,
      })
    ).rejects.toThrow('Invalid zoom');
  });
});
