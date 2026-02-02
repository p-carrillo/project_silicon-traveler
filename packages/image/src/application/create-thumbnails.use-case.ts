import { IThumbnailGeneratorPort, ThumbnailSize } from '../ports/thumbnail-generator.port';

export class CreateThumbnailsUseCase {
  constructor(private readonly thumbnailGenerator: IThumbnailGeneratorPort) {}

  async execute(imageBuffer: Buffer): Promise<Map<string, Buffer>> {
    const sizes: ThumbnailSize[] = [
      { width: 400, height: 400, suffix: '_grid' },
      { width: 1920, height: 1080, suffix: '_hero' },
    ];

    return await this.thumbnailGenerator.generate(imageBuffer, sizes);
  }
}
