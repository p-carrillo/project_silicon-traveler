import { Injectable } from '@nestjs/common';
import {
  IImageStorage,
  ImageStorageResult,
} from '../../domain/ports/image-storage.interface';

@Injectable()
export class PlaceholderImageStorage implements IImageStorage {
  async saveImage(
    _data: Buffer,
    _contentType: string,
    storageKey: string,
  ): Promise<ImageStorageResult> {
    const baseUrl = process.env.IMAGE_STORAGE_BASE_URL ?? 'https://storage.local';

    return {
      url: `${baseUrl}/${storageKey}`,
      storageKey,
    };
  }
}
