import { Point } from '@silicon-traveler/shared';
import { IRouteRepository } from '../ports/route-repository.port';
import { RoutePoint, RouteStatus } from '../domain/route-point.entity';

export interface UpdateRoutePointAdminInput {
  id: number;
  placeName?: string | null;
  country?: string | null;
  region?: string | null;
  coordinates?: Point;
  imagePrompt?: string | null;
  narrativePrompt?: string | null;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  status?: RouteStatus;
  errorMessage?: string | null;
}

export class UpdateRoutePointAdminUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(input: UpdateRoutePointAdminInput): Promise<RoutePoint> {
    const routePoint = await this.routeRepository.findById(input.id);
    if (!routePoint) {
      throw new Error(`RoutePoint ${input.id} not found`);
    }

    if (input.placeName !== undefined) routePoint.placeName = input.placeName;
    if (input.country !== undefined) routePoint.country = input.country;
    if (input.region !== undefined) routePoint.region = input.region;
    if (input.coordinates !== undefined) routePoint.coordinates = input.coordinates;
    if (input.imagePrompt !== undefined) routePoint.imagePrompt = input.imagePrompt;
    if (input.narrativePrompt !== undefined) routePoint.narrativePrompt = input.narrativePrompt;
    if (input.imagePath !== undefined) routePoint.imagePath = input.imagePath;
    if (input.thumbnailPath !== undefined) routePoint.thumbnailPath = input.thumbnailPath;
    if (input.status !== undefined) routePoint.status = input.status;
    if (input.errorMessage !== undefined) routePoint.errorMessage = input.errorMessage;

    routePoint.updatedAt = new Date();

    await this.routeRepository.update(routePoint);
    return routePoint;
  }
}

