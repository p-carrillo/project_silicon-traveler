import { Point } from '@silicon-traveler/shared';
import { IRouteRepository } from '../ports/route-repository.port';
import { RoutePoint, RouteStatus } from '../domain/route-point.entity';

export interface CreateFutureRoutePointInput {
  journeyId: number;
  coordinates: Point;
  placeName?: string | null;
  country?: string | null;
  region?: string | null;
  status?: RouteStatus;
}

export class CreateFutureRoutePointUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(input: CreateFutureRoutePointInput): Promise<RoutePoint> {
    const lastSequence = await this.routeRepository.getLastSequence(input.journeyId);
    const sequence = lastSequence + 1;

    return await this.routeRepository.create({
      journeyId: input.journeyId,
      sequence,
      placeName: input.placeName ?? null,
      coordinates: input.coordinates,
      country: input.country ?? null,
      region: input.region ?? null,
      isFferryCrossing: false,
      distanceFromPrevious: null,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      status: input.status ?? 'pending',
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    });
  }
}

