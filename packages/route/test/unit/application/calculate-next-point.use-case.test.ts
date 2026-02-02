import { describe, it, expect, vi } from 'vitest';
import { CalculateNextPointUseCase } from '../../../src/application/calculate-next-point.use-case';
import { calculateDistance } from '../../../../shared/src/database/geographic';

describe('CalculateNextPointUseCase', () => {
  it('returns a point within the expected distance range', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const useCase = new CalculateNextPointUseCase();
    const origin = { lat: 0, lng: 0 };
    const result = useCase.execute({
      currentPosition: origin,
      heading: 'east',
      minDistanceKm: 10,
      maxDistanceKm: 20,
    });

    const distance = calculateDistance(origin, result);
    expect(distance).toBeCloseTo(10, 1);

    randomSpy.mockRestore();
  });
});
