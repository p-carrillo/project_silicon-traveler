import { calculateDistance, Point } from '@silicon-traveler/shared';
import { IJourneyRepository } from '@silicon-traveler/journey';
import {
  IRouteRepository,
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  RoutePoint,
} from '@silicon-traveler/route';
import { PreparePhotoResult, PreparePhotoUseCase } from './prepare-photo.use-case';
import { PreparePhotoPromptsResult, PreparePhotoPromptsUseCase } from './prepare-photo-prompts.use-case';

type Heading = 'east' | 'west' | 'north' | 'south';
export type PrepareNextPhotoMode = 'full' | 'prompts-only';

export interface PrepareNextPhotoConfig {
  minDistanceKm: number;
  maxDistanceKm: number;
  cityRadiusKm: number;
  pendingSearchLimit: number;
  mode: PrepareNextPhotoMode;
}

export interface PrepareNextPhotoResult {
  routePointId: number;
  journeyId: number;
  sequence: number;
  placeName: string | null;
  region: string | null;
  country: string | null;
  coordinates: Point;
  isFerryCrossing: boolean;
  createdNewRoutePoint: boolean;
  mode: PrepareNextPhotoMode;
  prepared: PreparePhotoResult | PreparePhotoPromptsResult;
}

const DEFAULT_CONFIG: PrepareNextPhotoConfig = {
  minDistanceKm: 20,
  maxDistanceKm: 30,
  cityRadiusKm: 10,
  pendingSearchLimit: 20,
  mode: 'full',
};

export class PrepareNextPhotoUseCase {
  private readonly config: PrepareNextPhotoConfig;

  constructor(
    private readonly journeyRepository: IJourneyRepository,
    private readonly routeRepository: IRouteRepository,
    private readonly calculateNextPoint: CalculateNextPointUseCase,
    private readonly findNearestCity: FindNearestCityUseCase,
    private readonly geocodePoint: GeocodePointUseCase,
    private readonly detectWater: DetectWaterUseCase,
    private readonly preparePhotoUseCase: PreparePhotoUseCase,
    private readonly preparePhotoPromptsUseCase: PreparePhotoPromptsUseCase,
    config: Partial<PrepareNextPhotoConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute({ journeyId }: { journeyId: number }): Promise<PrepareNextPhotoResult> {
    const journey = await this.journeyRepository.findById(journeyId);
    if (!journey) {
      throw new Error(`Journey ${journeyId} not found`);
    }

    let routePoint = await this.findPendingRoutePoint(journeyId);
    let createdNewRoutePoint = false;

    if (!routePoint) {
      createdNewRoutePoint = true;

      const heading = this.resolveHeading(journey.heading);
      const nextCoordinates = this.calculateNextPoint.execute({
        currentPosition: journey.currentPosition,
        heading,
        minDistanceKm: this.config.minDistanceKm,
        maxDistanceKm: this.config.maxDistanceKm,
      });

      const distanceFromPrevious = calculateDistance(journey.currentPosition, nextCoordinates);
      const isWater = await this.safeExecute('water detection', () => this.detectWater.execute(journey.currentPosition), false);

      const lastSequence = await this.routeRepository.getLastSequence(journey.id);
      const routePointData = RoutePoint.create(
        journey.id,
        lastSequence + 1,
        nextCoordinates,
        isWater,
        distanceFromPrevious
      );
      const createdRoutePoint = await this.routeRepository.create(routePointData);
      routePoint = createdRoutePoint;

      const city = await this.safeExecute(
        'city lookup',
        () => this.findNearestCity.execute(createdRoutePoint.coordinates, this.config.cityRadiusKm),
        null
      );
      if (city) {
        createdRoutePoint.placeName = city.name;
        createdRoutePoint.osmData = city.tags;
      }

      const location = await this.safeExecute(
        'geocoding',
        () => this.geocodePoint.execute(createdRoutePoint.coordinates),
        null
      );
      if (location) {
        createdRoutePoint.country = location.country;
        createdRoutePoint.region = location.region;
        if (!createdRoutePoint.placeName && location.placeName && location.placeName !== 'Unknown') {
          createdRoutePoint.placeName = location.placeName;
        }
      }

      if (isWater) {
        createdRoutePoint.placeName = `Ferry crossing near ${createdRoutePoint.placeName || 'unknown'}`;
      }

      await this.routeRepository.update(createdRoutePoint);

      journey.updatePosition(nextCoordinates);
      await this.journeyRepository.update(journey);
    }

    if (!routePoint) {
      throw new Error(`Failed to prepare a route point for journey ${journeyId}`);
    }

    await this.ensureKnownPlace(routePoint);

    const mode = this.config.mode;
    const prepared =
      mode === 'prompts-only'
        ? await this.preparePhotoPromptsUseCase.execute(routePoint.id)
        : await this.preparePhotoUseCase.execute(routePoint.id);

    return {
      routePointId: routePoint.id,
      journeyId: routePoint.journeyId,
      sequence: routePoint.sequence,
      placeName: routePoint.placeName,
      region: routePoint.region,
      country: routePoint.country,
      coordinates: routePoint.coordinates,
      isFerryCrossing: routePoint.isFferryCrossing,
      createdNewRoutePoint,
      mode,
      prepared,
    };
  }

  private resolveHeading(value: string | null | undefined): Heading {
    const allowed: Heading[] = ['east', 'west', 'north', 'south'];
    if (value && allowed.includes(value as Heading)) {
      return value as Heading;
    }
    return 'east';
  }

  private async findPendingRoutePoint(journeyId: number): Promise<RoutePoint | null> {
    const pending = await this.routeRepository.findByStatus('pending', this.config.pendingSearchLimit);
    return pending.find((point) => point.journeyId === journeyId) || null;
  }

  private async safeExecute<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[prepare-next-photo] ${label} failed: ${message}`);
      return fallback;
    }
  }

  private async ensureKnownPlace(routePoint: RoutePoint): Promise<void> {
    if (!this.isKnownPlace(routePoint.placeName)) {
      routePoint.updateStatus('failed', 'Unknown place');
      await this.routeRepository.update(routePoint);
      throw new Error(`Unknown place for route point ${routePoint.id}`);
    }
  }

  private isKnownPlace(placeName: string | null | undefined): boolean {
    if (!placeName) {
      return false;
    }

    const normalized = placeName.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    if (normalized === 'unknown' || normalized === 'unknown place' || normalized === 'unknown location') {
      return false;
    }

    if (normalized.startsWith('unknown') || normalized.endsWith('unknown')) {
      return false;
    }

    return true;
  }
}
