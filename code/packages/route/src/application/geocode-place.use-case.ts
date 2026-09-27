import { INominatimPort, PlaceGeocodingResult } from '../ports/nominatim.port';

export class GeocodePlaceUseCase {
  constructor(private readonly nominatimPort: INominatimPort) {}

  async execute(query: string, acceptLanguage?: string): Promise<PlaceGeocodingResult | null> {
    if (!acceptLanguage) return await this.nominatimPort.geocodePlace(query);
    return await this.nominatimPort.geocodePlace(query, acceptLanguage);
  }
}
