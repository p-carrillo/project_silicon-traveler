export interface ImageGenerationResult {
  base64Data: string;
  contentType: string;
  model: string;
}

export interface IImageGenerator {
  generateImage(prompt: string, model: string): Promise<ImageGenerationResult>;
}
