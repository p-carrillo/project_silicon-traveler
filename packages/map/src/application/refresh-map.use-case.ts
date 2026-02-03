import { MapState } from '../domain/map-state.entity';
import { IMapStateRepository } from '../ports/map-state.repository.port';

export class RefreshMapUseCase {
  constructor(private readonly mapStateRepository: IMapStateRepository) {}

  async execute(photoId: number): Promise<MapState> {
    if (!Number.isFinite(photoId) || photoId <= 0) {
      throw new Error('Invalid photo id');
    }

    return this.mapStateRepository.touchLastPhoto(photoId);
  }
}
