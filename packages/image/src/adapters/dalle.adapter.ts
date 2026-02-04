import OpenAI from 'openai';
import { IImageGeneratorPort, GeneratedImage } from '../ports/image-generator.port';

export class DalleAdapter implements IImageGeneratorPort {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string): Promise<GeneratedImage> {
    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024', // Square format for printing
        quality: 'hd',
        style: 'natural', // More photographic, less artistic
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from DALL-E');
      }

      const image = response.data[0];
      if (!image.url) {
        throw new Error('No image URL returned from DALL-E');
      }

      return {
        url: image.url,
        revisedPrompt: image.revised_prompt,
      };
    } catch (error: any) {
      console.error('DALL-E API error:', error.message);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
}
