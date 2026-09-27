import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListRoutePointsUseCase } from '../../../src/application/list-route-points.use-case';
import { RoutePoint } from '../../../src/domain/route-point.entity';

const createRoutePoint = (id: number) =>
  new RoutePoint(
    id,
    1,
    id,
    `Place ${id}`,
    { lat: 1, lng: 2 },
    'Country',
    'Region',
    null,
    null,
    null,
    null,
    null,
    null,
    'pending',
    null,
    null,
    null,
    new Date('2026-01-01T00:00:00Z'),
    null,
    new Date('2026-01-01T00:00:00Z')
  );

describe('ListRoutePointsUseCase', () => {
  const routeRepository = {
    findByJourney: vi.fn(),
    countByJourney: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns route points and total for a journey', async () => {
    routeRepository.findByJourney.mockResolvedValue([createRoutePoint(1), createRoutePoint(2)]);
    routeRepository.countByJourney.mockResolvedValue(10);

    const useCase = new ListRoutePointsUseCase(routeRepository as any);

    const result = await useCase.execute({
      journeyId: 1,
      statuses: ['pending'],
      cityQuery: 'bilbao',
      order: 'id_desc',
      limit: 50,
      offset: 0,
    });

    expect(result.routePoints).toHaveLength(2);
    expect(result.total).toBe(10);
    expect(routeRepository.findByJourney).toHaveBeenCalledWith(1, {
      statuses: ['pending'],
      cityQuery: 'bilbao',
      order: 'id_desc',
      limit: 50,
      offset: 0,
    });
    expect(routeRepository.countByJourney).toHaveBeenCalledWith(1, ['pending'], 'bilbao');
  });
});
