import OpenAI from 'openai';
import { ILLMPort, ContentInput, GeneratedContent } from '../ports/llm.port';
import { selectCamera, getDefaultCamera } from '../config/photographer';
import type { CameraSelection } from '../config/photographer';
import { buildContentPrompt, CONTENT_SYSTEM_PROMPT } from '../prompts/content-prompts';

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
        model: 'gpt-4',
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

  private parseResponse(response: string): GeneratedContent {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      return {
        imagePrompt: parsed.imagePrompt || parsed.image_prompt || '',
        narrative: parsed.narrative || '',
        cameraMetadata: parsed.cameraMetadata || parsed.camera_metadata || this.getDefaultCamera(),
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
}
