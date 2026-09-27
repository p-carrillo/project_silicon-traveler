import { clampBoundingBox, isValidBoundingBox } from '../domain/bounding-box';
import { MapState } from '../domain/map-state.entity';
import { IMapStateRepository, SaveMapStateInput } from '../ports/map-state.repository.port';

export class SaveMapStateUseCase {
  constructor(private readonly mapStateRepository: IMapStateRepository) {}

  async execute(input: SaveMapStateInput): Promise<MapState> {
    const normalized = {
      bbox: clampBoundingBox(input.bbox),
      zoom: input.zoom,
    };

    if (!isValidBoundingBox(normalized.bbox)) {
      throw new Error('Invalid bounding box');
    }

    if (!Number.isFinite(normalized.zoom) || normalized.zoom < 1 || normalized.zoom > 12) {
      throw new Error('Invalid zoom');
    }

    return this.mapStateRepository.save(normalized);
  }
}
