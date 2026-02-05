import OpenAI from 'openai';
import {
  ILLMPort,
  ContentInput,
  GeneratedContent,
  TranslateContentInput,
  TranslatedContent,
} from '../ports/llm.port';
import { selectCamera, getDefaultCamera } from '../config/photographer';
import type { CameraSelection } from '../config/photographer';
import {
  buildContentPrompt,
  buildTranslationPrompt,
  CONTENT_SYSTEM_PROMPT,
} from '../prompts/content-prompts';

const CONTENT_MODEL = 'gpt-4o-mini';
const TRANSLATION_MODEL = 'gpt-4o-mini';

export class OpenAIAdapter implements ILLMPort {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(input: ContentInput): Promise<GeneratedContent> {
    const cameraSelection = selectCamera(`${input.placeName}|${input.region}|${input.country}`);
    const prompt = buildContentPrompt(input, cameraSelection);

    try {
      const completion = await this.client.chat.completions.create({
        model: CONTENT_MODEL,
        messages: [
          {
            role: 'system',
            content: CONTENT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      const parsed = this.parseResponse(response);
      return this.applyCameraSelection(parsed, cameraSelection);
    } catch (error: any) {
      console.error('OpenAI API error:', error.message);
      const fallback = this.getFallbackContent(input);
      return this.applyCameraSelection(fallback, cameraSelection);
    }
  }

  async translateContent(input: TranslateContentInput): Promise<TranslatedContent> {
    const prompt = buildTranslationPrompt(input);

    try {
      const completion = await this.client.chat.completions.create({
        model: TRANSLATION_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a translation engine. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseTranslationResponse(response, input);
    } catch (error: any) {
      console.error('OpenAI translation error:', error.message);
      return {
        imagePrompt: input.imagePrompt,
        narrative: input.narrative,
      };
    }
  }

  private parseResponse(response: string): GeneratedContent {
    try {
      const parsed = this.parseJsonResponse(response) as any;

      return {
        imagePrompt: parsed?.imagePrompt || parsed?.image_prompt || '',
        narrative: parsed?.narrative || '',
        cameraMetadata: parsed?.cameraMetadata || parsed?.camera_metadata || this.getDefaultCamera(),
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return {
        imagePrompt: 'A documentary black and white photograph of a street scene',
        narrative: 'Another day on the road.',
        cameraMetadata: this.getDefaultCamera(),
      };
    }
  }

  private getFallbackContent(input: ContentInput): GeneratedContent {
    return {
      imagePrompt: `Documentary black and white photograph of ${input.placeName}, ${input.country}. Magnum style, high contrast, grainy film aesthetic.`,
      narrative: `Walking through ${input.placeName}, I capture another moment of this endless journey. The light here is different.`,
      cameraMetadata: this.getDefaultCamera(),
    };
  }

  private getDefaultCamera() {
    const selection = getDefaultCamera();
    return {
      camera: selection.camera,
      lens: selection.lens,
      iso: 800,
      shutterSpeed: '1/125',
      aperture: 'f/2.8',
    };
  }

  private applyCameraSelection(content: GeneratedContent, cameraSelection: CameraSelection): GeneratedContent {
    return {
      ...content,
      cameraMetadata: {
        ...content.cameraMetadata,
        camera: cameraSelection.camera,
        lens: cameraSelection.lens,
      },
    };
  }

  private parseTranslationResponse(
    response: string,
    input: TranslateContentInput
  ): TranslatedContent {
    try {
      const parsed = this.parseJsonResponse(response) as any;
      const imagePrompt = parsed?.imagePrompt || parsed?.image_prompt || input.imagePrompt;
      const narrative = parsed?.narrative || input.narrative;
      return { imagePrompt, narrative };
    } catch (error) {
      console.error('Failed to parse translation response:', error);
      return {
        imagePrompt: input.imagePrompt,
        narrative: input.narrative,
      };
    }
  }

  private parseJsonResponse(response: string): unknown {
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleaned);
  }
}
