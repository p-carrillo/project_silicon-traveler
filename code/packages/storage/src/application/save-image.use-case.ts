import { IStoragePort, StoredFile } from '../ports/storage.port';

export interface SaveImageInput {
  buffer: Buffer;
  filename: string;
  date: Date;
}

export class SaveImageUseCase {
  constructor(private readonly storage: IStoragePort) {}

  async execute(input: SaveImageInput): Promise<StoredFile> {
    return await this.storage.saveImage(input.buffer, input.filename, input.date);
  }
}
