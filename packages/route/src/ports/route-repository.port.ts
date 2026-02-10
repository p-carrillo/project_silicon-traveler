import { RoutePoint, RouteStatus } from '../domain/route-point.entity';
import { Point } from '@silicon-traveler/shared';

export interface RoutePointContentTranslation {
  language: string;
  imagePrompt: string | null;
  narrative: string | null;
}

export interface RoutePointCreateParams {
  journeyId: number;
  sequence: number;
  placeName: string | null;
  coordinates: Point;
  country: string | null;
  region: string | null;
  isFferryCrossing: boolean;
  distanceFromPrevious: number | null;
  osmData: unknown | null;
  researchSummary: string | null;
  imagePrompt: string | null;
  narrativePrompt: string | null;
  cameraMetadata: unknown | null;
  status: RouteStatus;
  errorMessage: string | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  publishedAt: Date | null;
}

export interface FindRoutePointsByJourneyParams {
  statuses?: RouteStatus[];
  limit: number;
  offset: number;
}

export interface IRouteRepository {
  create(routePoint: RoutePointCreateParams): Promise<RoutePoint>;
  findById(id: number): Promise<RoutePoint | null>;
  findByStatus(status: RouteStatus, limit?: number): Promise<RoutePoint[]>;
  findFirstScheduledByJourney(journeyId: number): Promise<RoutePoint | null>;
  findNextBySequence(journeyId: number): Promise<RoutePoint | null>;
  findByJourney(journeyId: number, params: FindRoutePointsByJourneyParams): Promise<RoutePoint[]>;
  countByJourney(journeyId: number, statuses?: RouteStatus[]): Promise<number>;
  countByStatuses(statuses: RouteStatus[]): Promise<number>;
  upsertContentTranslations(
    routePointId: number,
    translations: RoutePointContentTranslation[]
  ): Promise<void>;
  findContentTranslations(routePointId: number): Promise<RoutePointContentTranslation[]>;
  update(routePoint: RoutePoint): Promise<void>;
  getLastSequence(journeyId: number): Promise<number>;
}
