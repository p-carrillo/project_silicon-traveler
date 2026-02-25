import axios from 'axios';
import { IRouteRepository, RoutePointContentTranslation } from '@silicon-traveler/route';
import { IBraveSearchPort, SearchResult } from '@silicon-traveler/research';
import { ILLMPort, selectPortraitParameters } from '@silicon-traveler/content';
import { IImageGeneratorPort, IThumbnailGeneratorPort } from '@silicon-traveler/image';
import { IStoragePort } from '@silicon-traveler/storage';
import { getI18nConfig } from '@silicon-traveler/shared';

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
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly braveSearch: IBraveSearchPort,
    private readonly llm: ILLMPort,
    private readonly imageGenerator: IImageGeneratorPort,
    private readonly thumbnailGenerator: IThumbnailGeneratorPort,
    private readonly storage: IStoragePort
  ) {}

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
      // 2. Research place
      const query = `${routePoint.placeName || 'Unknown'} ${routePoint.country || ''} history culture tourism`;
      const searchResults = await this.braveSearch.search(query, 3);
      const researchSummary = searchResults.map((r: SearchResult) => r.description).join(' ');

      // 3. Update status: researched + store summary
      routePoint.updateResearch(researchSummary, routePoint.osmData);
      await this.routeRepository.update(routePoint);

      // 4. Generate content
      const { supportedLanguages, defaultLanguage, contentBaseLanguage } = getI18nConfig();
      const baseLanguage = contentBaseLanguage || defaultLanguage;

      const content = await this.llm.generateContent({
        placeName: routePoint.placeName || 'Unknown Place',
        country: routePoint.country || 'Unknown Country',
        region: routePoint.region || 'Unknown Region',
        researchSummary,
        language: baseLanguage,
        portraitParameters: selectPortraitParameters(),
      });

      const baseImagePrompt = this.normalizePrompt(content.imagePrompt);
      const translations: RoutePointContentTranslation[] = [
        {
          language: baseLanguage,
          imagePrompt: baseImagePrompt,
          narrative: content.narrative,
        },
      ];

      for (const language of supportedLanguages) {
        if (language === baseLanguage) continue;
        const translated = await this.llm.translateContent({
          sourceLanguage: baseLanguage,
          targetLanguage: language,
          narrative: content.narrative,
          imagePrompt: baseImagePrompt,
        });

        translations.push({
          language,
          imagePrompt: this.normalizePrompt(translated.imagePrompt),
          narrative: translated.narrative,
        });
      }

      const defaultTranslation =
        translations.find((translation) => translation.language === defaultLanguage) ??
        translations[0];

      // 5. Update status: content_generated + store prompts/metadata
      const imagePrompt = this.normalizePrompt(defaultTranslation.imagePrompt ?? baseImagePrompt);
      const narrative = defaultTranslation.narrative || content.narrative;
      routePoint.updateContent(imagePrompt, narrative, content.cameraMetadata);
      await this.routeRepository.update(routePoint);
      await this.routeRepository.upsertContentTranslations(routePoint.id, translations);

      // 6. Generate image
      const image = await this.imageGenerator.generate(baseImagePrompt);

      // 7. Download image
      const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // 8. Generate thumbnails
      const thumbnails = await this.thumbnailGenerator.generate(imageBuffer, [
        { width: 400, height: 400, suffix: '_grid' },
        { width: 1024, height: 1024, suffix: '_hero' },
      ]);

      // 9. Save to storage
      const date = await this.resolveStorageDate(routePoint.journeyId, routePoint.sequence);
      const filename = `${routePointId}.jpg`;
      const savedImage = await this.storage.saveImage(imageBuffer, filename, date);

      const savedThumbnails = new Map<string, string>();
      for (const [suffix, buffer] of thumbnails) {
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
        narrative,
        imagePrompt,
        camera: content.cameraMetadata.camera,
        lens: content.cameraMetadata.lens,
        iso: content.cameraMetadata.iso,
        shutterSpeed: content.cameraMetadata.shutterSpeed,
        aperture: content.cameraMetadata.aperture,
        revisedPrompt: image.revisedPrompt || null,
      };
    } catch (error: any) {
      routePoint.updateStatus('failed', error.message);
      await this.routeRepository.update(routePoint);
      throw error;
    }
  }

  private normalizePrompt(prompt: unknown): string {
    if (typeof prompt === 'string' && prompt.trim().length > 0) {
      return prompt;
    }

    if (prompt !== null && prompt !== undefined) {
      try {
        const stringified = JSON.stringify(prompt);
        if (stringified && stringified !== 'null') {
          return stringified;
        }
      } catch (error) {
        console.warn('Failed to stringify image prompt:', error);
      }
    }

    return 'A documentary black and white photograph of a street scene';
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
