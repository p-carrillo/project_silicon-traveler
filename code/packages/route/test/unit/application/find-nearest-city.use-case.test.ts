import { describe, it, expect, vi } from 'vitest';
import { FindNearestCityUseCase } from '../../../src/application/find-nearest-city.use-case';

describe('FindNearestCityUseCase', () => {
  it('delegates to the overpass port', async () => {
    const overpass = {
      findNearestCity: vi.fn().mockResolvedValue({
        name: 'Test City',
        type: 'city',
        lat: 1,
        lon: 2,
        tags: {},
      }),
    };

    const useCase = new FindNearestCityUseCase(overpass as any);
    const point = { lat: 1, lng: 2 };
    const result = await useCase.execute(point, 5);

    expect(overpass.findNearestCity).toHaveBeenCalledWith(point, 5);
    expect(result?.name).toBe('Test City');
  });
});
