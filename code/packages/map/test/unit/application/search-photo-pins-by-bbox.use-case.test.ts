import { describe, it, expect, vi } from 'vitest';
import { SearchPhotoPinsByBboxUseCase } from '../../../src/application/search-photo-pins-by-bbox.use-case';

const makeRepo = () => ({
  findByBoundingBox: vi.fn().mockResolvedValue([]),
});

describe('SearchPhotoPinsByBboxUseCase', () => {
  it('passes normalized query and limit', async () => {
    const repo = makeRepo();
    const useCase = new SearchPhotoPinsByBboxUseCase(repo as any);

    await useCase.execute({
      bbox: { minLng: -20, minLat: -10, maxLng: 20, maxLat: 10 },
      limit: 1000,
      query: '  Berlin  ',
      language: 'es',
    });

    expect(repo.findByBoundingBox).toHaveBeenCalledWith({
      bbox: { minLng: -20, minLat: -10, maxLng: 20, maxLat: 10 },
      limit: 500,
      query: 'Berlin',
      language: 'es',
    });
  });

  it('rejects invalid bbox', async () => {
    const repo = makeRepo();
    const useCase = new SearchPhotoPinsByBboxUseCase(repo as any);

    await expect(
      useCase.execute({
        bbox: { minLng: 10, minLat: 5, maxLng: -10, maxLat: 5 },
        limit: 10,
      })
    ).rejects.toThrow('Invalid bounding box');
  });
});
