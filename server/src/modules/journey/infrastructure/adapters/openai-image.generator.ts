import { Injectable } from '@nestjs/common';
import {
  IImageGenerator,
  ImageGenerationResult,
} from '../../domain/ports/image-generator.interface';

@Injectable()
export class OpenAiImageGenerator implements IImageGenerator {
  async generateImage(
    prompt: string,
    model: string,
  ): Promise<ImageGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing.');
    }

    const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    const size = process.env.OPENAI_IMAGE_SIZE ?? '1024x1024';

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenAI image generation failed with status ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const base64Data = data.data?.[0]?.b64_json;

    if (!base64Data) {
      throw new Error('OpenAI image generation returned no image data.');
    }

    return {
      base64Data,
      contentType: 'image/png',
      model,
    };
  }
}
