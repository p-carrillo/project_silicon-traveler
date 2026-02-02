import { Point, calculateDestination } from '@silicon-traveler/shared';

export interface CalculateNextPointInput {
  currentPosition: Point;
  heading: 'east' | 'west' | 'north' | 'south';
  minDistanceKm: number;
  maxDistanceKm: number;
}

export class CalculateNextPointUseCase {
  execute(input: CalculateNextPointInput): Point {
    const { currentPosition, heading, minDistanceKm, maxDistanceKm } = input;
    
    // Random distance between min and max
    const distance = minDistanceKm + Math.random() * (maxDistanceKm - minDistanceKm);
    
    // Bearing in degrees: east = 90, west = 270, north = 0, south = 180
    const bearings: Record<string, number> = {
      east: 90,
      west: 270,
      north: 0,
      south: 180,
    };
    
    const bearing = bearings[heading];
    
    return calculateDestination(currentPosition, distance, bearing);
  }
}
