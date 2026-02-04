import axios from 'axios';
import { Point } from '@silicon-traveler/shared';
import { IOverpassPort, PlaceInfo } from '../ports/overpass.port';

export class OverpassAdapter implements IOverpassPort {
  private readonly baseUrl = 'https://overpass-api.de/api/interpreter';
  
  async findNearestCity(point: Point, radiusKm: number): Promise<PlaceInfo | null> {
    const radiusMeters = radiusKm * 1000;
    
    // Overpass query to find cities/towns/villages within radius
    const query = `
      [out:json];
      (
        node["place"~"^(city|town|village)$"](around:${radiusMeters},${point.lat},${point.lng});
        way["place"~"^(city|town|village)$"](around:${radiusMeters},${point.lat},${point.lng});
      );
      out center 1;
    `;
    
    try {
      const response = await axios.post(this.baseUrl, `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });
      
      if (response.data.elements && response.data.elements.length > 0) {
        const element = response.data.elements[0];
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        return {
          name: element.tags?.name || 'Unknown',
          type: element.tags?.place || 'unknown',
          lat,
          lon,
          tags: element.tags,
        };
      }
      
      return null;
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.message || 'Unknown error';
      console.error(`Overpass API error (city lookup): ${status ? `${status} ` : ''}${message}`);
      return null;
    }
  }
  
  async isWater(point: Point): Promise<boolean> {
    const query = `
      [out:json];
      is_in(${point.lat},${point.lng});
      area._["natural"="water"];
      out;
    `;
    
    try {
      const response = await axios.post(this.baseUrl, `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });
      
      return response.data.elements && response.data.elements.length > 0;
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.message || 'Unknown error';
      console.error(`Overpass API error (water detection): ${status ? `${status} ` : ''}${message}`);
      return false;
    }
  }
}
