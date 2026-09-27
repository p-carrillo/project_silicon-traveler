import { MapState } from '../domain/map-state.entity';
import { DEFAULT_BOUNDING_BOX } from '../domain/bounding-box';
import { IMapStateRepository } from '../ports/map-state.repository.port';

export class GetMapStateUseCase {
  constructor(private readonly mapStateRepository: IMapStateRepository) {}

  async execute(): Promise<MapState> {
    const state = await this.mapStateRepository.get();

    if (state) {
      return state;
    }

    return new MapState(1, DEFAULT_BOUNDING_BOX, 1.2, null, new Date());
  }
}
