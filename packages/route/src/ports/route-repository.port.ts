import { RoutePoint, RouteStatus } from '../domain/route-point.entity';

export interface RoutePointContentTranslation {
  language: string;
  imagePrompt: string | null;
  narrative: string | null;
}

export interface IRouteRepository {
  create(routePoint: Omit<RoutePoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoutePoint>;
  findById(id: number): Promise<RoutePoint | null>;
  findByStatus(status: RouteStatus, limit?: number): Promise<RoutePoint[]>;
  findNextBySequence(journeyId: number): Promise<RoutePoint | null>;
  countByStatuses(statuses: RouteStatus[]): Promise<number>;
  upsertContentTranslations(
    routePointId: number,
    translations: RoutePointContentTranslation[]
  ): Promise<void>;
  findContentTranslations(routePointId: number): Promise<RoutePointContentTranslation[]>;
  update(routePoint: RoutePoint): Promise<void>;
  getLastSequence(journeyId: number): Promise<number>;
}
