import { calculateDistance, Point } from '@silicon-traveler/shared';
import { IJourneyRepository } from '@silicon-traveler/journey';
import {
  IRouteRepository,
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  PlanEastwardStepUseCase,
  FindAirLandingEastUseCase,
  RoutePoint,
  TravelMode,
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
  travelMode: TravelMode;
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
    private readonly planEastwardStep: PlanEastwardStepUseCase,
    private readonly findAirLandingEast: FindAirLandingEastUseCase,
    private readonly findNearestCity: FindNearestCityUseCase,
    private readonly geocodePoint: GeocodePointUseCase,
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

      const landStep = await this.safeExecute(
        'eastward land planning',
        () =>
          this.planEastwardStep.execute({
            currentPosition: journey.currentPosition,
            heading,
            minDistanceKm: this.config.minDistanceKm,
            maxDistanceKm: this.config.maxDistanceKm,
          }),
        null
      );

      const airStep =
        !landStep && heading === 'east'
          ? await this.safeExecute(
              'air landing planning',
              () =>
                this.findAirLandingEast.execute({
                  currentPosition: journey.currentPosition,
                }),
              null
            )
          : null;

      const fallbackCoordinates = this.calculateNextPoint.execute({
        currentPosition: journey.currentPosition,
        heading,
        minDistanceKm: this.config.minDistanceKm,
        maxDistanceKm: this.config.maxDistanceKm,
      });

      const nextCoordinates = landStep?.coordinates ?? airStep?.coordinates ?? fallbackCoordinates;
      const distanceFromPrevious =
        landStep?.distanceFromPrevious ??
        airStep?.distanceFromPrevious ??
        calculateDistance(journey.currentPosition, fallbackCoordinates);
      const travelMode: TravelMode = landStep?.travelMode ?? airStep?.travelMode ?? 'land';

      const lastSequence = await this.routeRepository.getLastSequence(journey.id);
      const routePointData = {
        journeyId: journey.id,
        sequence: lastSequence + 1,
        placeName: null,
        coordinates: nextCoordinates,
        country: null,
        region: null,
        isFferryCrossing: false,
        travelMode,
        distanceFromPrevious,
        osmData: null,
        researchSummary: null,
        imagePrompt: null,
        narrativePrompt: null,
        cameraMetadata: null,
        status: 'pending' as const,
        errorMessage: null,
        imagePath: null,
        thumbnailPath: null,
        publishedAt: null,
      };
      const createdRoutePoint = await this.routeRepository.create(routePointData);
      routePoint = createdRoutePoint;

      if (airStep) {
        createdRoutePoint.placeName = airStep.placeName;
        createdRoutePoint.country = airStep.country;
        createdRoutePoint.region = airStep.region;
        createdRoutePoint.osmData = airStep.osmData;
      } else {
        const city = await this.safeExecute(
          'city lookup',
          () => this.findNearestCity.execute(createdRoutePoint.coordinates, this.config.cityRadiusKm),
          null
        );
        if (city) {
          createdRoutePoint.placeName = city.name;
          createdRoutePoint.osmData = city.tags;
        }
      }

      const location = await this.safeExecute(
        'geocoding',
        () => this.geocodePoint.execute(createdRoutePoint.coordinates),
        null
      );
      if (location) {
        createdRoutePoint.country = createdRoutePoint.country || location.country;
        createdRoutePoint.region = createdRoutePoint.region || location.region;
        if (!createdRoutePoint.placeName && location.placeName && location.placeName !== 'Unknown') {
          createdRoutePoint.placeName = location.placeName;
        }
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
      travelMode: routePoint.travelMode,
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
