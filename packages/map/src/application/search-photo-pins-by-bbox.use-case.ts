import { IPhotoPinsRepository, PhotoPinsQuery } from '../ports/photo-pins.repository.port';
import { PhotoPin } from '../domain/photo-pin.entity';
import { clampBoundingBox, isValidBoundingBox } from '../domain/bounding-box';

export class SearchPhotoPinsByBboxUseCase {
  constructor(private readonly photoPinsRepository: IPhotoPinsRepository) {}

  async execute(query: PhotoPinsQuery): Promise<PhotoPin[]> {
    const limit = Math.min(Math.max(query.limit, 1), 500);
    const bbox = clampBoundingBox(query.bbox);
    const normalizedQuery = query.query?.trim();

    if (!isValidBoundingBox(bbox)) {
      throw new Error('Invalid bounding box');
    }

    return this.photoPinsRepository.findByBoundingBox({
      bbox,
      limit,
      query: normalizedQuery,
    });
  }
}
