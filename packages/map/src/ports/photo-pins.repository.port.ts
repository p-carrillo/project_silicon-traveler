import { BoundingBox } from '../domain/bounding-box';
import { PhotoPin } from '../domain/photo-pin.entity';

export interface PhotoPinsQuery {
  bbox: BoundingBox;
  limit: number;
  query?: string;
}

export interface IPhotoPinsRepository {
  findByBoundingBox(query: PhotoPinsQuery): Promise<PhotoPin[]>;
}
