export interface ImageStorageResult {
  url: string;
  storageKey: string;
}

export interface IImageStorage {
  saveImage(
    data: Buffer,
    contentType: string,
    storageKey: string,
  ): Promise<ImageStorageResult>;
}
