import { Point } from '@silicon-traveler/shared';
import { IOverpassPort, PlaceInfo } from '../ports/overpass.port';

export class FindNearestCityUseCase {
  constructor(private readonly overpassPort: IOverpassPort) {}

  async execute(point: Point, radiusKm: number = 10): Promise<PlaceInfo | null> {
    return await this.overpassPort.findNearestCity(point, radiusKm);
  }
}
