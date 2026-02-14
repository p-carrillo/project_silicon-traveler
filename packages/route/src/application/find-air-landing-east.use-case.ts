import { calculateDestination, calculateDistance, Point } from '@silicon-traveler/shared';
import { TravelMode } from '../domain/route-point.entity';
import { DetectWaterUseCase } from './detect-water.use-case';
import { FindNearestCityUseCase } from './find-nearest-city.use-case';
import { GeocodePointUseCase } from './geocode-point.use-case';

export interface FindAirLandingEastInput {
  currentPosition: Point;
}

export interface FindAirLandingEastConfig {
  sampleDistanceKm: number;
  maxDistanceKm: number;
  citySearchRadiiKm: number[];
}

export interface AirLandingStep {
  coordinates: Point;
  travelMode: TravelMode;
  distanceFromPrevious: number;
  placeName: string | null;
  country: string | null;
  region: string | null;
  osmData: Record<string, string> | null;
}

const DEFAULT_CONFIG: FindAirLandingEastConfig = {
  sampleDistanceKm: parseNumber(process.env.ROUTE_LANDFALL_SAMPLE_KM, 25),
  maxDistanceKm: parseNumber(process.env.ROUTE_LANDFALL_MAX_KM, 1500),
  citySearchRadiiKm: [10, 25, 50, 100],
};

function parseNumber(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export class FindAirLandingEastUseCase {
  private readonly config: FindAirLandingEastConfig;

  constructor(
    private readonly detectWater: DetectWaterUseCase,
    private readonly findNearestCity: FindNearestCityUseCase,
    private readonly geocodePoint: GeocodePointUseCase,
    config: Partial<FindAirLandingEastConfig> = {}
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async execute(input: FindAirLandingEastInput): Promise<AirLandingStep | null> {
    const landfall = await this.findFirstLandfall(input.currentPosition);
    if (!landfall) {
      return null;
    }

    let coordinates: Point = landfall;
    let placeName: string | null = null;
    let osmData: Record<string, string> | null = null;

    for (const radiusKm of this.config.citySearchRadiiKm) {
      const nearestCity = await this.findNearestCity.execute(landfall, radiusKm);
      if (!nearestCity) {
        continue;
      }

      coordinates = { lat: nearestCity.lat, lng: nearestCity.lon };
      placeName = nearestCity.name || null;
      osmData = nearestCity.tags || null;
      break;
    }

    const geocoding = await this.geocodePoint.execute(coordinates);

    const country = geocoding?.country ?? null;
    const region = geocoding?.region ?? null;

    if (!placeName) {
      placeName = geocoding?.placeName && geocoding.placeName !== 'Unknown' ? geocoding.placeName : null;
    }

    return {
      coordinates,
      travelMode: 'air',
      distanceFromPrevious: calculateDistance(input.currentPosition, coordinates),
      placeName,
      country,
      region,
      osmData,
    };
  }

  private async findFirstLandfall(currentPosition: Point): Promise<Point | null> {
    if (this.config.sampleDistanceKm <= 0 || this.config.maxDistanceKm <= 0) {
      return null;
    }

    for (
      let distanceKm = this.config.sampleDistanceKm;
      distanceKm <= this.config.maxDistanceKm;
      distanceKm += this.config.sampleDistanceKm
    ) {
      const candidate = calculateDestination(currentPosition, distanceKm, 90);
      const isWater = await this.detectWater.execute(candidate);

      if (!isWater) {
        return candidate;
      }
    }

    return null;
  }
}
