import sharp from 'sharp';
import { IThumbnailGeneratorPort, ThumbnailSize } from '../ports/thumbnail-generator.port';

export class SharpAdapter implements IThumbnailGeneratorPort {
  async toJpeg(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error: any) {
      console.error('Failed to normalize image to JPEG:', error.message);
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  async generate(imageBuffer: Buffer, sizes: ThumbnailSize[]): Promise<Map<string, Buffer>> {
    const thumbnails = new Map<string, Buffer>();

    for (const size of sizes) {
      try {
        const thumbnail = await sharp(imageBuffer)
          .resize(size.width, size.height, {
            fit: 'cover', // Cover maintains aspect ratio and crops
            position: 'center',
          })
          .jpeg({ quality: 90 })
          .toBuffer();

        thumbnails.set(size.suffix, thumbnail);
      } catch (error: any) {
        console.error(`Failed to generate thumbnail ${size.suffix}:`, error.message);
        throw new Error(`Thumbnail generation failed for ${size.suffix}: ${error.message}`);
      }
    }

    return thumbnails;
  }
}
