import { IRouteRepository } from '@silicon-traveler/route';
import { IPhotoRepository, CreatePhotoInput, PhotoMetadata } from '../domain/photo.repository';
import { PreparePhotoResult } from './prepare-photo.use-case';
import { photoMetadataConfig } from '../config/photo-metadata';

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

    const title = this.buildTitle(routePoint.placeName);
    const location = this.buildLocation(routePoint.placeName, routePoint.region, routePoint.country);
    const tags = this.buildTags(routePoint);
    const normalizedTags = tags.length ? tags : null;
    const editorial = this.buildEditorialMetadata(routePoint.sequence);
    const metadata = this.buildMetadata(preparedPhoto, routePoint.imagePrompt, routePoint.isFferryCrossing);

    const photoInput: CreatePhotoInput = {
      routePointId: routePoint.id,
      title,
      imageUrl: preparedPhoto.imageUrl,
      gridThumbnailUrl: preparedPhoto.gridThumbnailUrl,
      narrative: preparedPhoto.narrative,
      location,
      coordinates: routePoint.coordinates,
      camera: preparedPhoto.camera,
      lens: preparedPhoto.lens,
      iso: preparedPhoto.iso,
      shutterSpeed: preparedPhoto.shutterSpeed,
      rollNumber: editorial.rollNumber,
      frameNumber: editorial.frameNumber,
      seriesName: editorial.seriesName,
      volumeIssue: editorial.volumeIssue,
      tags: normalizedTags,
      metadata,
      publishedAt: new Date(),
    };

    const photoId = await this.photoRepository.create(photoInput);
    
    routePoint.updateStatus('published');
    await this.routeRepository.update(routePoint);

    return photoId;
  }

  private buildTitle(placeName: string | null): string {
    return placeName?.trim() || 'Unknown place';
  }

  private buildLocation(placeName: string | null, region: string | null, country: string | null): string {
    const parts = [placeName, region, country].filter((part) => part && part.trim().length > 0);
    return parts.length ? parts.join(', ') : 'Unknown location';
  }

  private buildTags(routePoint: { placeName?: string | null; region?: string | null; country?: string | null; osmData?: any; isFferryCrossing?: boolean }): string[] {
    const tags: string[] = [];
    const addTag = (value?: string | null) => {
      if (!value) return;
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      tags.push(trimmed);
    };

    addTag(routePoint.placeName);
    addTag(routePoint.region);
    addTag(routePoint.country);

    const osmPlace = routePoint.osmData?.place;
    addTag(typeof osmPlace === 'string' ? osmPlace : null);

    if (routePoint.isFferryCrossing) {
      tags.push('ferry', 'crossing', 'water');
    }

    tags.push('documentary', 'black and white');

    const normalized = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.toLowerCase());

    return Array.from(new Set(normalized));
  }

  private buildEditorialMetadata(sequence: number): {
    rollNumber: string | null;
    frameNumber: string | null;
    seriesName: string | null;
    volumeIssue: string | null;
  } {
    const { framesPerRoll, rollPrefix, seriesName, volumeIssue } = photoMetadataConfig;
    if (!Number.isFinite(framesPerRoll) || framesPerRoll <= 0) {
      return {
        rollNumber: null,
        frameNumber: null,
        seriesName,
        volumeIssue,
      };
    }

    const safeSequence = Number.isFinite(sequence) ? sequence : 1;
    const frameIndex = Math.max(safeSequence, 1) - 1;
    const rollNumber = Math.floor(frameIndex / framesPerRoll) + 1;
    const frameNumber = (frameIndex % framesPerRoll) + 1;

    return {
      rollNumber: `${rollPrefix} ${String(rollNumber).padStart(2, '0')}`,
      frameNumber: String(frameNumber).padStart(2, '0'),
      seriesName,
      volumeIssue,
    };
  }

  private buildMetadata(
    preparedPhoto: PreparePhotoResult,
    imagePrompt: string | null,
    isFferryCrossing: boolean
  ): PhotoMetadata {
    return {
      aperture: preparedPhoto.aperture,
      revisedPrompt: preparedPhoto.revisedPrompt,
      heroThumbnailUrl: preparedPhoto.heroThumbnailUrl,
      imagePrompt: imagePrompt ?? null,
      isFerryCrossing: isFferryCrossing,
    };
  }
}
