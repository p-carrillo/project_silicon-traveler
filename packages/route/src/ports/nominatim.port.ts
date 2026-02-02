import { Point } from '@silicon-traveler/shared';

export interface GeocodingResult {
  country: string;
  region: string;
  displayName: string;
}

export interface INominatimPort {
  reverseGeocode(point: Point): Promise<GeocodingResult | null>;
}
