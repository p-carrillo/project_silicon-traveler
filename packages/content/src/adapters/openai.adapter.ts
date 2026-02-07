import OpenAI from 'openai';
import {
  ILLMPort,
  ContentInput,
  GeneratedContent,
  TranslateContentInput,
  TranslatedContent,
} from '../ports/llm.port';
import { generateCameraMetadata } from '../config/photographer';
import {
  buildNarrativePrompt,
  buildTranslationPrompt,
  buildImagePrompt,
  NARRATIVE_SYSTEM_PROMPT,
} from '../prompts/content-prompts';
import { selectPortraitParameters } from '../config/portrait';
import type { PortraitParameters } from '../config/portrait';

const NARRATIVE_MODEL = 'gpt-4o-mini';
const TRANSLATION_MODEL = 'gpt-4o-mini';

export class OpenAIAdapter implements ILLMPort {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(input: ContentInput): Promise<GeneratedContent> {
    const seed = `${input.placeName}|${input.region}|${input.country}`;
    const portraitParameters = input.portraitParameters ?? selectPortraitParameters();
    const contentInput = input.portraitParameters ? input : { ...input, portraitParameters };
    const prompt = buildNarrativePrompt(contentInput);

    try {
      const response = await this.client.responses.create({
        model: NARRATIVE_MODEL,
        reasoning: { effort: 'medium' },
        instructions: NARRATIVE_SYSTEM_PROMPT,
        input: prompt,
        max_output_tokens: 200,
      });

      const narrative = this.parseNarrative(response.output_text || '');
      const cameraMetadata = generateCameraMetadata(seed);
      const imagePrompt = buildImagePrompt({
        narrative,
        portraitParameters,
        placeName: input.placeName,
        region: input.region,
        country: input.country,
        language: input.language,
      });

      return { narrative, cameraMetadata, imagePrompt };
    } catch (error: any) {
      console.error('OpenAI API error:', error.message);
      return this.getFallbackContent(input, portraitParameters);
    }
  }

  private parseNarrative(response: string): string {
    let text = response.trim();
    // Remove markdown code blocks if present
    if (text.startsWith('```')) {
      text = text.replace(/```[\w]*\n?/, '').replace(/\n?```$/, '');
    }
    // Remove surrounding quotes if present
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
      text = text.slice(1, -1);
    }
    return text.trim() || 'Another day on the road.';
  }

  async translateContent(input: TranslateContentInput): Promise<TranslatedContent> {
    const prompt = buildTranslationPrompt(input);

    try {
      const response = await this.client.responses.create({
        model: TRANSLATION_MODEL,
        reasoning: { effort: 'medium' },
        instructions: 'You are a translation engine. Return only valid JSON.',
        input: prompt,
        max_output_tokens: 800,
      });

      const responseText = response.output_text || '';
      return this.parseTranslationResponse(responseText, input);
    } catch (error: any) {
      console.error('OpenAI translation error:', error.message);
      return {
        imagePrompt: input.imagePrompt,
        narrative: input.narrative,
      };
    }
  }

  private getFallbackContent(
    input: ContentInput,
    portraitParameters: PortraitParameters
  ): GeneratedContent {
    const seed = `${input.placeName}|${input.region}|${input.country}`;
    const narrative = `Walking through ${input.placeName}, I capture another moment of this endless journey. The light here is different.`;
    const cameraMetadata = generateCameraMetadata(seed);
    const imagePrompt = buildImagePrompt({
      narrative,
      portraitParameters,
      placeName: input.placeName,
      region: input.region,
      country: input.country,
      language: input.language,
    });

    return { narrative, cameraMetadata, imagePrompt };
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
