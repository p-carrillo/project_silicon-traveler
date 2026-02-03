import { BoundingBox } from './bounding-box';

export class MapState {
  constructor(
    public readonly id: number,
    public readonly bbox: BoundingBox,
    public readonly zoom: number,
    public readonly lastPhotoId: number | null,
    public readonly updatedAt: Date
  ) {}
}
