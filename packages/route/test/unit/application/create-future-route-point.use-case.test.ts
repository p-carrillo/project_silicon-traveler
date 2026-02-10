import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateFutureRoutePointUseCase } from '../../../src/application/create-future-route-point.use-case';

describe('CreateFutureRoutePointUseCase', () => {
  const routeRepository = {
    getLastSequence: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a pending route point with the next sequence', async () => {
    routeRepository.getLastSequence.mockResolvedValue(41);
    routeRepository.create.mockResolvedValue({ id: 99 });

    const useCase = new CreateFutureRoutePointUseCase(routeRepository as any);

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
});

