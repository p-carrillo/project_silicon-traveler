import { Point } from '@silicon-traveler/shared';
import { IOverpassPort } from '../ports/overpass.port';

export class DetectWaterUseCase {
  constructor(private readonly overpassPort: IOverpassPort) {}

  async execute(point: Point): Promise<boolean> {
    return await this.overpassPort.isWater(point);
  }
}
