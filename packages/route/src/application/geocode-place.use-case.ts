import { INominatimPort, PlaceGeocodingResult } from '../ports/nominatim.port';

export class GeocodePlaceUseCase {
  constructor(private readonly nominatimPort: INominatimPort) {}

  async execute(query: string): Promise<PlaceGeocodingResult | null> {
    return await this.nominatimPort.geocodePlace(query);
  }
}
