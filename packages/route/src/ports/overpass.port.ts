import { Point } from '@silicon-traveler/shared';

export interface PlaceInfo {
  name: string;
  type: string;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export interface IOverpassPort {
  findNearestCity(point: Point, radiusKm: number): Promise<PlaceInfo | null>;
}
