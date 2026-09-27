import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateFutureRoutePointUseCase } from '../../../src/application/create-future-route-point.use-case';

describe('CreateFutureRoutePointUseCase', () => {
  const routeRepository = {
    getLastSequence: vi.fn(),
    create: vi.fn(),
  };
  const geocodePlace = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a pending route point with the next sequence', async () => {
    routeRepository.getLastSequence.mockResolvedValue(41);
    routeRepository.create.mockResolvedValue({ id: 99 });
    geocodePlace.execute.mockResolvedValue(null);

    const useCase = new CreateFutureRoutePointUseCase(routeRepository as any, geocodePlace as any);

    const result = await useCase.execute({
      journeyId: 1,
      coordinates: { lat: 10, lng: 20 },
      placeName: 'City',
      country: 'Country',
      region: 'Region',
    });

    expect(result).toEqual({ id: 99 });
    expect(routeRepository.getLastSequence).toHaveBeenCalledWith(1);
    expect(routeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: 1,
        sequence: 42,
        placeName: 'City',
        coordinates: { lat: 10, lng: 20 },
        country: 'Country',
        region: 'Region',
        status: 'pending',
      })
    );
  });

  it('snaps coordinates when place geocoding resolves', async () => {
    routeRepository.getLastSequence.mockResolvedValue(41);
    routeRepository.create.mockResolvedValue({ id: 100 });
    geocodePlace.execute.mockResolvedValue({
      coordinates: { lat: 11, lng: 22 },
      placeName: 'Normalized City',
      country: 'Normalized Country',
      region: 'Normalized Region',
      displayName: 'Normalized City, Normalized Region, Normalized Country',
    });

    const useCase = new CreateFutureRoutePointUseCase(routeRepository as any, geocodePlace as any);

    await useCase.execute({
      journeyId: 1,
      coordinates: { lat: 10, lng: 20 },
      placeName: 'City',
      country: 'Country',
      region: 'Region',
    });

    expect(geocodePlace.execute).toHaveBeenCalledWith('City, Region, Country');
    expect(routeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: { lat: 11, lng: 22 },
        placeName: 'Normalized City',
        country: 'Normalized Country',
        region: 'Normalized Region',
      })
    );
  });

  it('falls back to input coordinates when place geocoding fails', async () => {
    routeRepository.getLastSequence.mockResolvedValue(41);
    routeRepository.create.mockResolvedValue({ id: 101 });
    geocodePlace.execute.mockRejectedValue(new Error('nominatim timeout'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const useCase = new CreateFutureRoutePointUseCase(routeRepository as any, geocodePlace as any);

    await useCase.execute({
      journeyId: 1,
      coordinates: { lat: 10, lng: 20 },
      placeName: 'City',
      country: 'Country',
      region: 'Region',
    });

    expect(routeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: { lat: 10, lng: 20 },
        placeName: 'City',
        country: 'Country',
        region: 'Region',
      })
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('place geocoding failed'));
    warnSpy.mockRestore();
  });
});
