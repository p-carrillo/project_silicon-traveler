import { Point } from '@silicon-traveler/shared';
import { IJourneyRepository } from '@silicon-traveler/journey';
import {
  IRouteRepository,
  ResolveNextStopUseCase,
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
    private readonly resolveNextStop: ResolveNextStopUseCase,
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
      const resolvedStop = await this.resolveNextStop.execute({
        origin: journey.currentPosition,
        heading,
        minDistanceKm: this.config.minDistanceKm,
        maxDistanceKm: this.config.maxDistanceKm,
        cityRadiusKm: this.config.cityRadiusKm,
      });

      const distanceFromPrevious = resolvedStop.distanceFromOrigin;

      const lastSequence = await this.routeRepository.getLastSequence(journey.id);
      const routePointData = RoutePoint.create(
        journey.id,
        lastSequence + 1,
        resolvedStop.coordinates,
        distanceFromPrevious
      );
      const createdRoutePoint = await this.routeRepository.create(routePointData);
      routePoint = createdRoutePoint;

      createdRoutePoint.placeName = resolvedStop.placeName;
      createdRoutePoint.region = resolvedStop.region;
      createdRoutePoint.country = resolvedStop.country;
      createdRoutePoint.osmData = resolvedStop.osmData;
      createdRoutePoint.coordinates = resolvedStop.coordinates;

      await this.routeRepository.update(createdRoutePoint);

      journey.updatePosition(createdRoutePoint.coordinates);
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
