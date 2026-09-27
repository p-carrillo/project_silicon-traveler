import { MapState } from '../domain/map-state.entity';
import { BoundingBox } from '../domain/bounding-box';

export interface SaveMapStateInput {
  bbox: BoundingBox;
  zoom: number;
}

export interface IMapStateRepository {
  get(): Promise<MapState | null>;
  save(input: SaveMapStateInput): Promise<MapState>;
  touchLastPhoto(photoId: number): Promise<MapState>;
}
