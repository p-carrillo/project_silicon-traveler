import { pool } from '@silicon-traveler/shared';
import { MariaDBRouteRepository } from '@silicon-traveler/route';
import { MariaDBPhotoRepository, PublishPhotoUseCase } from '@silicon-traveler/photo';

export class PublisherJob {
  private isRunning = false;

  constructor(
    private readonly routeRepo: MariaDBRouteRepository,
    private readonly publishPhotoUseCase: PublishPhotoUseCase
  ) {}

  async execute(): Promise<void> {
    if (this.isRunning) {
      console.log('[Publisher] Already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[Publisher] Starting at ${new Date().toISOString()}`);

    try {
      // Get next image_ready route point
      const readyPoints = await this.routeRepo.findByStatus('image_ready', 1);

      if (readyPoints.length === 0) {
        console.log('[Publisher] No photos ready to publish');
        return;
      }

      const routePoint = readyPoints[0];
      console.log(`[Publisher] Publishing route point ${routePoint.id}: ${routePoint.placeName || 'Unknown'}`);

      // Extract prepared data from route point
      const preparedPhoto = {
        imageUrl: routePoint.imagePath || '/images/default.jpg',
        gridThumbnailUrl: routePoint.thumbnailPath || '/images/default_grid.jpg',
        heroThumbnailUrl: routePoint.thumbnailPath?.replace('_grid', '_hero') || '/images/default_hero.jpg',
        narrative: routePoint.narrativePrompt || 'Another day on the road.',
        camera: routePoint.cameraMetadata?.camera || 'Leica M11',
        lens: routePoint.cameraMetadata?.lens || '35mm f/1.4',
        iso: routePoint.cameraMetadata?.iso || 800,
        shutterSpeed: routePoint.cameraMetadata?.shutterSpeed || '1/125',
        aperture: routePoint.cameraMetadata?.aperture || 'f/2.8',
        revisedPrompt: routePoint.imagePrompt,
      };

      const photoId = await this.publishPhotoUseCase.execute(routePoint.id, preparedPhoto);
      console.log(`[Publisher] ✓ Published photo ${photoId}`);

    } catch (error: any) {
      console.error('[Publisher] Error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }
}

export function createPublisherJob(): PublisherJob {
  const routeRepo = new MariaDBRouteRepository();
  const photoRepo = new MariaDBPhotoRepository(pool as any);

  const publishPhotoUseCase = new PublishPhotoUseCase(photoRepo, routeRepo);

  return new PublisherJob(routeRepo, publishPhotoUseCase);
}
