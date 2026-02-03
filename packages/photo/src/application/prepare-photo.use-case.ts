import axios from 'axios';
import { IRouteRepository } from '@silicon-traveler/route';
import { IBraveSearchPort } from '@silicon-traveler/research';
import { ILLMPort } from '@silicon-traveler/content';
import { IImageGeneratorPort, IThumbnailGeneratorPort } from '@silicon-traveler/image';
import { IStoragePort } from '@silicon-traveler/storage';

export interface PreparePhotoResult {
  imageUrl: string;
  gridThumbnailUrl: string;
  heroThumbnailUrl: string;
  narrative: string;
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
      const researchSummary = searchResults.map((r) => r.description).join(' ');

      // 3. Update status: researched + store summary
      routePoint.updateResearch(researchSummary, routePoint.osmData);
      await this.routeRepository.update(routePoint);

      // 4. Generate content
      const content = await this.llm.generateContent({
        placeName: routePoint.placeName || 'Unknown Place',
        country: routePoint.country || 'Unknown Country',
        region: routePoint.region || 'Unknown Region',
        researchSummary,
        isFferryCrossing: routePoint.isFferryCrossing,
      });

      // 5. Update status: content_generated + store prompts/metadata
      routePoint.updateContent(content.imagePrompt, content.narrative, content.cameraMetadata);
      await this.routeRepository.update(routePoint);

      // 6. Generate image
      const image = await this.imageGenerator.generate(content.imagePrompt);

      // 7. Download image
      const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // 8. Generate thumbnails
      const thumbnails = await this.thumbnailGenerator.generate(imageBuffer, [
        { width: 400, height: 400, suffix: '_grid' },
        { width: 1920, height: 1080, suffix: '_hero' },
      ]);

      // 9. Save to storage
      const date = new Date();
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
        narrative: content.narrative,
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
}
