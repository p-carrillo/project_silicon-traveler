import { Point } from '@silicon-traveler/shared';

export interface GeocodingResult {
  country: string;
  region: string;
  displayName: string;
  placeName: string;
}

export interface PlaceGeocodingResult extends GeocodingResult {
  coordinates: Point;
}

export interface INominatimPort {
  reverseGeocode(point: Point): Promise<GeocodingResult | null>;
  geocodePlace(query: string): Promise<PlaceGeocodingResult | null>;
}
