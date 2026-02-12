import { IRouteRepository } from '../ports/route-repository.port';
import { RoutePoint, RouteStatus } from '../domain/route-point.entity';

export interface ListRoutePointsInput {
  journeyId: number;
  statuses?: RouteStatus[];
  limit: number;
  offset: number;
}

export interface ListRoutePointsResult {
  routePoints: RoutePoint[];
  total: number;
  limit: number;
  offset: number;
}

export class ListRoutePointsUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(input: ListRoutePointsInput): Promise<ListRoutePointsResult> {
    const [routePoints, total] = await Promise.all([
      this.routeRepository.findByJourney(input.journeyId, {
        statuses: input.statuses,
        limit: input.limit,
        offset: input.offset,
      }),
      this.routeRepository.countByJourney(input.journeyId, input.statuses),
    ]);

    return {
      routePoints,
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }
}

