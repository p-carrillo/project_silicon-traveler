import { Point } from '@silicon-traveler/shared';

export type RoutingProfile = 'driving' | 'walking' | 'cycling';

export interface RoutePath {
  distanceKm: number;
  coordinates: Point[];
}

export interface IRoutingPort {
  getRoute(from: Point, to: Point, profile?: RoutingProfile): Promise<RoutePath | null>;
}
