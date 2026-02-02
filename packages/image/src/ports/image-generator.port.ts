export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

export interface IImageGeneratorPort {
  generate(prompt: string): Promise<GeneratedImage>;
}
