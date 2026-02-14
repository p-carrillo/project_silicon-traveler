import { describe, it, expect, vi } from 'vitest';
import { FindAirLandingEastUseCase } from '../../../src/application/find-air-landing-east.use-case';

describe('FindAirLandingEastUseCase', () => {
  it('finds landfall to the east and resolves nearest city', async () => {
    const detectWater = {
      execute: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
    };

    const findNearestCity = {
      execute: vi.fn().mockResolvedValueOnce({
        name: 'Landing City',
        type: 'city',
        lat: 10,
        lon: 20,
        tags: { place: 'city' },
      }),
    };

    const geocodePoint = {
      execute: vi.fn().mockResolvedValue({
        country: 'Country',
        region: 'Region',
        displayName: 'Landing City',
        placeName: 'Landing City',
      }),
    };

    const useCase = new FindAirLandingEastUseCase(
      detectWater as any,
      findNearestCity as any,
      geocodePoint as any,
      {
        sampleDistanceKm: 100,
        maxDistanceKm: 300,
        citySearchRadiiKm: [10, 25],
      }
    );

    const result = await useCase.execute({ currentPosition: { lat: 0, lng: 0 } });

    expect(result).toEqual(
      expect.objectContaining({
        travelMode: 'air',
        placeName: 'Landing City',
        country: 'Country',
        region: 'Region',
        coordinates: { lat: 10, lng: 20 },
      })
    );
    expect(result?.distanceFromPrevious).toBeGreaterThan(0);
    expect(detectWater.execute).toHaveBeenCalledTimes(2);
  });

  it('returns null when no landfall is found', async () => {
    const detectWater = {
      execute: vi.fn().mockResolvedValue(true),
    };

    const findNearestCity = {
      execute: vi.fn(),
    };

    const geocodePoint = {
      execute: vi.fn(),
    };

    const useCase = new FindAirLandingEastUseCase(
      detectWater as any,
      findNearestCity as any,
      geocodePoint as any,
      {
        sampleDistanceKm: 100,
        maxDistanceKm: 300,
      }
    );

    const result = await useCase.execute({ currentPosition: { lat: 0, lng: 0 } });

    expect(result).toBeNull();
    expect(findNearestCity.execute).not.toHaveBeenCalled();
    expect(geocodePoint.execute).not.toHaveBeenCalled();
  });
});
