import { describe, it, expect, vi } from 'vitest';
import { calculateDistance } from '@silicon-traveler/shared';
import { PlanEastwardStepUseCase } from '../../../src/application/plan-eastward-step.use-case';

describe('PlanEastwardStepUseCase', () => {
  it('plans an eastward land step within configured distance', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const routingPort = {
      getRoute: vi.fn(async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => ({
        distanceKm: 50,
        coordinates: [from, to],
      })),
    };

    const fallbackCalculator = {
      execute: vi.fn().mockReturnValue({ lat: 0, lng: 0 }),
    };

    const useCase = new PlanEastwardStepUseCase(routingPort as any, fallbackCalculator as any);

    const result = await useCase.execute({
      currentPosition: { lat: 43.3328, lng: -8.3186 },
      heading: 'east',
      minDistanceKm: 20,
      maxDistanceKm: 30,
    });

    expect(result).not.toBeNull();
    expect(result?.travelMode).toBe('land');
    expect(result!.coordinates.lng).toBeGreaterThan(-8.3186);
    const distance = calculateDistance({ lat: 43.3328, lng: -8.3186 }, result!.coordinates);
    expect(distance).toBeCloseTo(20, 1);

    randomSpy.mockRestore();
  });

  it('returns null when no valid route exists for eastward movement', async () => {
    const routingPort = {
      getRoute: vi.fn().mockResolvedValue(null),
    };

    const fallbackCalculator = {
      execute: vi.fn(),
    };

    const useCase = new PlanEastwardStepUseCase(routingPort as any, fallbackCalculator as any);

    const result = await useCase.execute({
      currentPosition: { lat: 0, lng: 0 },
      heading: 'east',
      minDistanceKm: 20,
      maxDistanceKm: 30,
    });

    expect(result).toBeNull();
    expect(fallbackCalculator.execute).not.toHaveBeenCalled();
  });

  it('falls back to classic heading calculation for non-east headings', async () => {
    const routingPort = {
      getRoute: vi.fn(),
    };

    const fallbackCalculator = {
      execute: vi.fn().mockReturnValue({ lat: 1, lng: -1 }),
    };

    const useCase = new PlanEastwardStepUseCase(routingPort as any, fallbackCalculator as any);

    const result = await useCase.execute({
      currentPosition: { lat: 0, lng: 0 },
      heading: 'west',
      minDistanceKm: 20,
      maxDistanceKm: 30,
    });

    expect(result).toEqual(
      expect.objectContaining({
        coordinates: { lat: 1, lng: -1 },
        travelMode: 'land',
      })
    );
    expect(fallbackCalculator.execute).toHaveBeenCalledTimes(1);
    expect(routingPort.getRoute).not.toHaveBeenCalled();
  });
});
