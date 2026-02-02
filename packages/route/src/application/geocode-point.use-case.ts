import { Point } from '@silicon-traveler/shared';
import { INominatimPort, GeocodingResult } from '../ports/nominatim.port';

export class GeocodePointUseCase {
  constructor(private readonly nominatimPort: INominatimPort) {}

  async execute(point: Point): Promise<GeocodingResult | null> {
    return await this.nominatimPort.reverseGeocode(point);
  }
}
