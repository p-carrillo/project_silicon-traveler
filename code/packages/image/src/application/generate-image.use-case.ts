import { IImageGeneratorPort } from '../ports/image-generator.port';

export class GenerateImageUseCase {
  constructor(private readonly imageGenerator: IImageGeneratorPort) {}

  async execute(prompt: string): Promise<{ url: string; revisedPrompt?: string }> {
    return await this.imageGenerator.generate(prompt);
  }
}
