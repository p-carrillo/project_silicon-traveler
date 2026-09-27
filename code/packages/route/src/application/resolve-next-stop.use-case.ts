import { calculateDistance, type Point } from '@silicon-traveler/shared';
import { CalculateNextPointUseCase } from './calculate-next-point.use-case';
import { FindNearestCityUseCase } from './find-nearest-city.use-case';
import { GeocodePlaceUseCase } from './geocode-place.use-case';
import { GeocodePointUseCase } from './geocode-point.use-case';

export type NextStopHeading = 'east' | 'west' | 'north' | 'south';

export interface ResolveNextStopInput {
  origin: Point;
  heading: NextStopHeading;
  minDistanceKm: number;
  maxDistanceKm: number;
  cityRadiusKm: number;
}

export interface ResolvedNextStop {
  coordinates: Point;
  distanceFromOrigin: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  osmData: unknown | null;
}

/**
 * Stateless production planning boundary. Persistence is deliberately owned by
 * callers so diagnostics can use it with an in-memory origin.
 */
export class ResolveNextStopUseCase {
  constructor(
    private readonly calculateNextPoint: CalculateNextPointUseCase,
    private readonly findNearestCity: FindNearestCityUseCase,
    private readonly geocodePlace: GeocodePlaceUseCase,
    private readonly geocodePoint: GeocodePointUseCase
  ) {}

  async execute(input: ResolveNextStopInput): Promise<ResolvedNextStop> {
    const projected = this.calculateNextPoint.execute({
      currentPosition: input.origin,
      heading: input.heading,
      minDistanceKm: input.minDistanceKm,
      maxDistanceKm: input.maxDistanceKm,
    });
    let coordinates = projected;
    let placeName: string | null = null;
    let region: string | null = null;
    let country: string | null = null;
    let osmData: unknown | null = null;

    const city = await this.safeExecute(
      () => this.findNearestCity.execute(projected, input.cityRadiusKm),
      null
    );
    if (city) {
      coordinates = { lat: city.lat, lng: city.lon };
      placeName = city.name;
      osmData = city.tags;
    }

    const location = await this.safeExecute(() => this.geocodePoint.execute(coordinates), null);
    if (location) {
      country = location.country;
      region = location.region;
      if (!placeName && this.isKnownPlace(location.placeName)) placeName = location.placeName;
    }

    const placeQuery = [placeName, region, country].filter((part): part is string => Boolean(part?.trim())).join(', ');
    if (placeQuery) {
      const snapped = await this.safeExecute(() => this.geocodePlace.execute(placeQuery), null);
      if (snapped) {
        coordinates = snapped.coordinates;
        if (this.isKnownPlace(snapped.placeName)) placeName = snapped.placeName;
        country = snapped.country || country;
        region = snapped.region || region;
      }
    }

    return { coordinates, distanceFromOrigin: calculateDistance(input.origin, projected), placeName, region, country, osmData };
  }

  private async safeExecute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try { return await fn(); } catch { return fallback; }
  }

  private isKnownPlace(value: string | null | undefined): value is string {
    const normalized = value?.trim().toLowerCase();
    return Boolean(normalized && normalized !== 'unknown' && normalized !== 'unknown place' && normalized !== 'unknown location' && !normalized.startsWith('unknown') && !normalized.endsWith('unknown'));
  }
}
