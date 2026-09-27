import { pool } from '@silicon-traveler/shared';
import axios from 'axios';
import { MariaDBRouteRepository } from '@silicon-traveler/route';
import { MariaDBPhotoRepository, PublishPhotoUseCase } from '@silicon-traveler/photo';

interface CameraMetadata {
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
}

function isCameraMetadata(value: unknown): value is CameraMetadata {
  if (typeof value !== 'object' || value === null) return false;

  const metadata = value as Record<string, unknown>;
  return (
    typeof metadata.camera === 'string' &&
    typeof metadata.lens === 'string' &&
    typeof metadata.iso === 'number' &&
    typeof metadata.shutterSpeed === 'string' &&
    typeof metadata.aperture === 'string'
  );
}

export class PublisherJob {
  private isRunning = false;
  private readonly apiUrl = process.env.API_URL || 'http://api:3000';
  private readonly apiKey = process.env.API_KEY;

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
      const cameraMetadata = isCameraMetadata(routePoint.cameraMetadata) ? routePoint.cameraMetadata : null;
      console.log(`[Publisher] Publishing route point ${routePoint.id}: ${routePoint.placeName || 'Unknown'}`);

      // Extract prepared data from route point
      const preparedPhoto = {
        imageUrl: routePoint.imagePath || '/images/default.jpg',
        gridThumbnailUrl: routePoint.thumbnailPath || '/images/default_grid.jpg',
        heroThumbnailUrl: routePoint.thumbnailPath?.replace('_grid', '_hero') || '/images/default_hero.jpg',
        narrative: routePoint.narrativePrompt || 'Another day on the road.',
        imagePrompt: routePoint.imagePrompt || '',
        camera: cameraMetadata?.camera || 'Leica M11',
        lens: cameraMetadata?.lens || '50mm',
        iso: cameraMetadata?.iso || 800,
        shutterSpeed: cameraMetadata?.shutterSpeed || '1/125',
        aperture: cameraMetadata?.aperture || 'f/2.8',
        revisedPrompt: null,
      };

      const photoId = await this.publishPhotoUseCase.execute(routePoint.id, preparedPhoto);
      console.log(`[Publisher] ✓ Published photo ${photoId}`);
      await this.notifyMapRefresh(photoId);

    } catch (error: any) {
      console.error('[Publisher] Error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  private async notifyMapRefresh(photoId: number): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      await axios.post(
        `${this.apiUrl}/api/map/refresh`,
        { photo_id: photoId },
        { headers, timeout: 8000 }
      );
      console.log(`[Publisher] ✓ Map refreshed for photo ${photoId}`);
    } catch (error: any) {
      console.error('[Publisher] Failed to refresh map:', error?.message || error);
    }
  }
}

export function createPublisherJob(): PublisherJob {
  const routeRepo = new MariaDBRouteRepository();
  const photoRepo = new MariaDBPhotoRepository(pool as any);

  const publishPhotoUseCase = new PublishPhotoUseCase(photoRepo, routeRepo);

  return new PublisherJob(routeRepo, publishPhotoUseCase);
}
