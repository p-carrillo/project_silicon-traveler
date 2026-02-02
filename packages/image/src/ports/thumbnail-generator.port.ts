export interface ThumbnailSize {
  width: number;
  height: number;
  suffix: string;
}

export interface IThumbnailGeneratorPort {
  generate(imageBuffer: Buffer, sizes: ThumbnailSize[]): Promise<Map<string, Buffer>>;
}
