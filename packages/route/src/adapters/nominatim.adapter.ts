import axios from 'axios';
import { Point } from '@silicon-traveler/shared';
import { INominatimPort, GeocodingResult } from '../ports/nominatim.port';

export class NominatimAdapter implements INominatimPort {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  
  async reverseGeocode(point: Point): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: point.lat,
          lon: point.lng,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'SiliconTraveler/1.0', // Nominatim requires User-Agent
        },
        timeout: 10000,
      });
      
      const data = response.data;
      const address = data.address || {};
      
      return {
        country: address.country || 'Unknown',
        region: address.state || address.region || address.county || 'Unknown',
        displayName: data.display_name || 'Unknown location',
      };
    } catch (error) {
      console.error('Nominatim API error:', error);
      return null;
    }
  }
}
