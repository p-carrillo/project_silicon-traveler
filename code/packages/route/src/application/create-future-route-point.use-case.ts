import { Point } from '@silicon-traveler/shared';
import { IRouteRepository } from '../ports/route-repository.port';
import { RoutePoint, RouteStatus } from '../domain/route-point.entity';
import { GeocodePlaceUseCase } from './geocode-place.use-case';

export interface CreateFutureRoutePointInput {
  journeyId: number;
  coordinates: Point;
  placeName?: string | null;
  country?: string | null;
  region?: string | null;
  status?: RouteStatus;
}

export class CreateFutureRoutePointUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly geocodePlace?: GeocodePlaceUseCase
  ) {}

  async execute(input: CreateFutureRoutePointInput): Promise<RoutePoint> {
    const lastSequence = await this.routeRepository.getLastSequence(input.journeyId);
    const sequence = lastSequence + 1;
    let coordinates = input.coordinates;
    let placeName = input.placeName ?? null;
    let country = input.country ?? null;
    let region = input.region ?? null;

    const placeQuery = this.buildPlaceQuery({ placeName, region, country });
    if (this.geocodePlace && placeQuery) {
      try {
        const geocoded = await this.geocodePlace.execute(placeQuery);
        if (geocoded) {
          coordinates = geocoded.coordinates;
          placeName = geocoded.placeName || placeName;
          country = geocoded.country || country;
          region = geocoded.region || region;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[create-future-route-point] place geocoding failed: ${message}`);
      }
    }

    return await this.routeRepository.create({
      journeyId: input.journeyId,
      sequence,
      placeName,
      coordinates,
      country,
      region,
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

  private buildPlaceQuery(input: {
    placeName: string | null;
    region: string | null;
    country: string | null;
  }): string | null {
    const placeName = input.placeName?.trim();
    if (!placeName) {
      return null;
    }

    const region = input.region?.trim();
    const country = input.country?.trim();

    return [placeName, region, country].filter(Boolean).join(', ');
  }
}
