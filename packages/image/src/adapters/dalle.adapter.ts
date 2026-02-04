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
      const model = process.env.IMAGE_MODEL || 'gpt-image-1.5';
      
      const baseParams: any = {
        model: model as 'gpt-image-1.5' | 'gpt-image-1' | 'gpt-image-1-mini' | 'dall-e-3' | 'dall-e-2',
        prompt,
        n: 1,
        size: '1024x1024', // Square format for printing
      };
      
      // Quality parameter differs between GPT Image and DALL-E
      if (model.startsWith('gpt-image')) {
        baseParams.quality = 'high'; // GPT Image: high, medium, low, auto
      } else if (model === 'dall-e-3') {
        baseParams.quality = 'hd'; // DALL-E 3: hd, standard
        baseParams.style = 'natural'; // DALL-E 3 only: natural, vivid
      }
      // dall-e-2 uses 'standard' quality by default (no parameter needed)
      
      const response = await this.client.images.generate(baseParams);

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from API');
      }

      const image = response.data[0];
      
      // GPT Image models return base64, DALL-E returns URL
      const isGptImage = model.startsWith('gpt-image');
      if (isGptImage) {
        if (!image.b64_json) {
          throw new Error('No base64 image data returned from GPT Image');
        }
        // Convert base64 to data URL for consistent interface
        const dataUrl = `data:image/png;base64,${image.b64_json}`;
        return {
          url: dataUrl,
          revisedPrompt: image.revised_prompt,
        };
      } else {
        if (!image.url) {
          throw new Error('No image URL returned from DALL-E');
        }
        return {
          url: image.url,
          revisedPrompt: image.revised_prompt,
        };
      }
    } catch (error: any) {
      console.error('DALL-E API error:', error.message);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
}
