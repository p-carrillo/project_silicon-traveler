import OpenAI from 'openai';
import type { ResearchSummaryInput } from '@silicon-traveler/research';
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
  buildResearchSummaryPrompt,
  buildTranslationPrompt,
  buildImagePrompt,
  NARRATIVE_SYSTEM_PROMPT,
} from '../prompts/content-prompts';
import { buildVisualBrief, type VisualBrief } from '../domain/visual-brief';

const NARRATIVE_MODEL = 'gpt-4o-mini';
const TRANSLATION_MODEL = 'gpt-4o-mini';

export class OpenAIAdapter implements ILLMPort {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async summarizeResearch(input: ResearchSummaryInput): Promise<string> {
    const prompt = buildResearchSummaryPrompt(input);
    try {
      const response = await this.client.responses.create({
        model: NARRATIVE_MODEL,
        instructions: 'You are a careful research editor. Synthesize only facts present in the supplied sources.',
        input: prompt,
        max_output_tokens: 500,
      });
      const summary = response.output_text?.trim();
      if (!summary) throw new Error('The model returned an empty summary');
      return summary;
    } catch (error: unknown) {
      const details = error instanceof Error && error.message ? error.message : 'Unknown OpenAI research summary error';
      console.error('OpenAI research summary error:', details);
      throw new Error('Research summary generation failed: ' + details);
    }
  }

  async generateContent(input: ContentInput): Promise<GeneratedContent> {
    const seed = `${input.placeName}|${input.region}|${input.country}`;
    const visualBrief = resolveVisualBrief(input);
    const contentInput: ContentInput = { ...input, visualBrief };
    const prompt = buildNarrativePrompt(contentInput);

    try {
      const response = await this.client.responses.create({
        model: NARRATIVE_MODEL,
        instructions: NARRATIVE_SYSTEM_PROMPT,
        input: prompt,
        max_output_tokens: 200,
      });

      const narrative = this.parseNarrative(response.output_text || '');
      const cameraMetadata = generateCameraMetadata(seed);
      const imagePrompt = buildImagePrompt({
        visualBrief,
        placeName: input.placeName,
        region: input.region,
        country: input.country,
        reflection: narrative,
        language: input.language,
      });

      return { narrative, cameraMetadata, imagePrompt };
    } catch (error: unknown) {
      console.error('OpenAI API error:', error instanceof Error ? error.message : 'Unknown OpenAI content error');
      return this.getFallbackContent(input);
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
        instructions: 'You are a translation engine. Return only valid JSON.',
        input: prompt,
        max_output_tokens: 800,
      });

      const responseText = response.output_text || '';
      return this.parseTranslationResponse(responseText, input);
    } catch (error: unknown) {
      console.error('OpenAI translation error:', error instanceof Error ? error.message : 'Unknown OpenAI translation error');
      return {
        imagePrompt: input.imagePrompt,
        narrative: input.narrative,
      };
    }
  }

  private getFallbackContent(input: ContentInput): GeneratedContent {
    const seed = `${input.placeName}|${input.region}|${input.country}`;
    const narrative = `Passing through ${input.placeName}. The data streams in but something about this place resists easy parsing.`;
    const cameraMetadata = generateCameraMetadata(seed);
    const visualBrief = resolveVisualBrief(input);
    const imagePrompt = buildImagePrompt({
      visualBrief,
      placeName: input.placeName,
      region: input.region,
      country: input.country,
      reflection: narrative,
      language: input.language,
    });

    return { narrative, cameraMetadata, imagePrompt };
  }

  private parseTranslationResponse(
    response: string,
    input: TranslateContentInput
  ): TranslatedContent {
    try {
      const parsed = this.parseJsonResponse(response);
      const translation = isRecord(parsed) ? parsed : null;
      const imagePrompt = readNonEmptyString(translation?.imagePrompt) ?? readNonEmptyString(translation?.image_prompt) ?? input.imagePrompt;
      const narrative = readNonEmptyString(translation?.narrative) ?? input.narrative;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function resolveVisualBrief(input: ContentInput): VisualBrief {
  if (input.visualBrief) return input.visualBrief;
  const editorialBrief = input.editorialBrief;
  return buildVisualBrief({
    placeName: input.placeName,
    factualAnchor: editorialBrief?.factualAnchor ?? [input.placeName, input.region, input.country].filter(Boolean).join(', '),
    visualMaterialAnchor: editorialBrief?.visualMaterialAnchor ?? '',
    researchSupported: editorialBrief?.researchSupported ?? false,
    sequence: 0,
  });
}
