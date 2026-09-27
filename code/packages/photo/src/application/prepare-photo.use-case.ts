import { IRouteRepository } from '@silicon-traveler/route';
import { IBraveSearchPort } from '@silicon-traveler/research';
import {
  getEditorialGenerationConfig,
  type EditorialGenerationConfig,
  type ILLMPort,
} from '@silicon-traveler/content';
import { IImageGeneratorPort, IThumbnailGeneratorPort } from '@silicon-traveler/image';
import { IStoragePort } from '@silicon-traveler/storage';
import { PhotoPreparationCore } from './photo-preparation-core';

export interface PreparePhotoResult {
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  narrative: string;
  imagePrompt: string;
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
  revisedPrompt: string | null;
}

export class PreparePhotoUseCase {
  private readonly core: PhotoPreparationCore;
  private readonly editorialConfig: EditorialGenerationConfig;
  constructor(
    private readonly routeRepository: IRouteRepository,
    braveSearch: IBraveSearchPort,
    llm: ILLMPort,
    imageGenerator: IImageGeneratorPort,
    thumbnailGenerator: IThumbnailGeneratorPort,
    private readonly storage: IStoragePort,
    editorialConfig: EditorialGenerationConfig = getEditorialGenerationConfig()
  ) {
    this.editorialConfig = editorialConfig;
    this.core = new PhotoPreparationCore(braveSearch, llm, imageGenerator, thumbnailGenerator, undefined, editorialConfig);
  }

  async execute(routePointId: number): Promise<PreparePhotoResult> {
    // 1. Get route point
    const routePoint = await this.routeRepository.findById(routePointId);
    if (!routePoint) {
      throw new Error(`RoutePoint ${routePointId} not found`);
    }

    if (routePoint.status !== 'pending') {
      throw new Error(`RoutePoint ${routePointId} already processed (status: ${routePoint.status})`);
    }

    try {
      const recentNarratives = this.editorialConfig.recentHistoryLimit > 0
        ? await this.routeRepository.findRecentNarrativesByJourney(
            routePoint.journeyId, routePoint.sequence, this.editorialConfig.recentHistoryLimit
          )
        : [];
      const prepared = await this.core.execute({
        ...routePoint,
        recentNarratives: recentNarratives.map((entry) => entry.narrative),
      }, {
        researched: async (researchSummary) => {
          routePoint.updateResearch(researchSummary, routePoint.osmData);
          await this.routeRepository.update(routePoint);
        },
        contentGenerated: async ({ imagePrompt, narrative, cameraMetadata, translations, visualBrief }) => {
          routePoint.updateContent(imagePrompt, narrative, cameraMetadata, visualBrief);
          await this.routeRepository.update(routePoint);
          await this.routeRepository.upsertContentTranslations(routePoint.id, translations);
        },
        visualBriefFinalized: async (visualBrief) => {
          routePoint.updateVisualBrief(visualBrief);
          await this.routeRepository.update(routePoint);
        },
      });

      // 9. Save to storage
      const date = await this.resolveStorageDate(routePoint.journeyId, routePoint.sequence);
      const filename = `${routePointId}.jpg`;
      const savedImage = await this.storage.saveImage(prepared.imageBuffer, filename, date);

      const savedThumbnails = new Map<string, string>();
      for (const [suffix, buffer] of prepared.thumbnails) {
        const saved = await this.storage.saveThumbnail(buffer, filename, suffix, date);
        savedThumbnails.set(suffix, saved.url);
      }

      // 10. Update status: image_ready + store image paths
      routePoint.updateImages(savedImage.url, savedThumbnails.get('_grid')!);
      await this.routeRepository.update(routePoint);

      return {
        imageUrl: savedImage.url,
        gridThumbnailUrl: savedThumbnails.get('_grid')!,
        heroThumbnailUrl: savedThumbnails.get('_hero')!,
        narrative: prepared.narrative,
        imagePrompt: prepared.imagePrompt,
        camera: prepared.cameraMetadata.camera,
        lens: prepared.cameraMetadata.lens,
        iso: prepared.cameraMetadata.iso,
        shutterSpeed: prepared.cameraMetadata.shutterSpeed,
        aperture: prepared.cameraMetadata.aperture,
        revisedPrompt: prepared.revisedPrompt,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Photo preparation failed';
      routePoint.updateStatus('failed', message);
      await this.routeRepository.update(routePoint);
      throw error;
    }
  }

  private async resolveStorageDate(journeyId: number, sequence: number): Promise<Date> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstScheduled = await this.routeRepository.findFirstScheduledByJourney(journeyId);
    if (!firstScheduled) {
      return today;
    }

    const offsetDays = Math.max(sequence - firstScheduled.sequence, 0);
    const scheduledDate = new Date(today);
    scheduledDate.setDate(scheduledDate.getDate() + offsetDays);
    return scheduledDate;
  }
}
