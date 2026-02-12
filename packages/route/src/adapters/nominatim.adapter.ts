import axios from 'axios';
import { Point } from '@silicon-traveler/shared';
import { INominatimPort, GeocodingResult, PlaceGeocodingResult } from '../ports/nominatim.port';
import { derivePlaceName, type NominatimAddress } from '../domain/place-name';

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
      const address = (data.address || {}) as NominatimAddress;
      
      return {
        country: address.country || 'Unknown',
        region: address.state || address.region || address.county || 'Unknown',
        displayName: data.display_name || 'Unknown location',
        placeName: derivePlaceName(address),
      };
    } catch (error) {
      console.error('Nominatim API error:', error);
      return null;
    }
  }

  async geocodePlace(query: string): Promise<PlaceGeocodingResult | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
        headers: {
          'User-Agent': 'SiliconTraveler/1.0',
        },
        timeout: 10000,
      });

      if (!Array.isArray(response.data) || response.data.length === 0) {
        return null;
      }

      const first = response.data[0] as {
        lat?: string;
        lon?: string;
        display_name?: string;
        address?: NominatimAddress;
      };

      const lat = Number(first.lat);
      const lng = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      const address = (first.address || {}) as NominatimAddress;

      return {
        coordinates: { lat, lng },
        country: address.country || 'Unknown',
        region: address.state || address.region || address.county || 'Unknown',
        displayName: first.display_name || 'Unknown location',
        placeName: derivePlaceName(address),
      };
    } catch (error) {
      console.error('Nominatim API search error:', error);
      return null;
    }
  }
}
