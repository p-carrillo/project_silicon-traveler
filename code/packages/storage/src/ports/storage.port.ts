export interface StoredFile {
  path: string;
  url: string;
}

export interface IStoragePort {
  saveImage(buffer: Buffer, filename: string, date: Date): Promise<StoredFile>;
  saveThumbnail(buffer: Buffer, filename: string, suffix: string, date: Date): Promise<StoredFile>;
  getImageUrl(path: string): string;
  deleteImage(path: string): Promise<void>;
}
