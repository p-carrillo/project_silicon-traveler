import { IStoragePort, StoredFile } from '../ports/storage.port';

export interface SaveThumbnailsInput {
  thumbnails: Map<string, Buffer>;
  filename: string;
  date: Date;
}

export class SaveThumbnailsUseCase {
  constructor(private readonly storage: IStoragePort) {}

  async execute(input: SaveThumbnailsInput): Promise<Map<string, StoredFile>> {
    const results = new Map<string, StoredFile>();

    for (const [suffix, buffer] of input.thumbnails) {
      const stored = await this.storage.saveThumbnail(buffer, input.filename, suffix, input.date);
      results.set(suffix, stored);
    }

    return results;
  }
}
