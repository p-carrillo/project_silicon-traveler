import { IRouteRepository } from '@silicon-traveler/route';
import { IPhotoRepository, CreatePhotoInput } from '../domain/photo.repository';
import { PreparePhotoResult } from './prepare-photo.use-case';

export class PublishPhotoUseCase {
  constructor(
    private readonly photoRepository: IPhotoRepository,
    private readonly routeRepository: IRouteRepository
  ) {}

  async execute(routePointId: number, preparedPhoto: PreparePhotoResult): Promise<number> {
    const routePoint = await this.routeRepository.findById(routePointId);
    if (!routePoint) {
      throw new Error(`RoutePoint ${routePointId} not found`);
    }

    if (routePoint.status !== 'image_ready') {
      throw new Error(`RoutePoint ${routePointId} not ready for publishing (status: ${routePoint.status})`);
    }

    const photoInput: CreatePhotoInput = {
      journeyId: routePoint.journeyId,
      routePointId: routePoint.id,
      imageUrl: preparedPhoto.imageUrl,
      gridThumbnailUrl: preparedPhoto.gridThumbnailUrl,
      heroThumbnailUrl: preparedPhoto.heroThumbnailUrl,
      narrative: preparedPhoto.narrative,
      camera: preparedPhoto.camera,
      lens: preparedPhoto.lens,
      iso: preparedPhoto.iso,
      shutterSpeed: preparedPhoto.shutterSpeed,
      aperture: preparedPhoto.aperture,
      revisedPrompt: preparedPhoto.revisedPrompt,
      publishedAt: new Date(),
    };

    const photoId = await this.photoRepository.create(photoInput);
    
    routePoint.updateStatus('published');
    await this.routeRepository.update(routePoint);

    return photoId;
  }
}
