import OpenAI from 'openai';
import { ILLMPort, ContentInput, GeneratedContent } from '../ports/llm.port';

export class OpenAIAdapter implements ILLMPort {
  private readonly client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(input: ContentInput): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(input);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a documentary photographer traveling the world on foot. You write in first person with introspection and attention to detail, inspired by Magnum photographers.',
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
      return this.parseResponse(response);
    } catch (error: any) {
      console.error('OpenAI API error:', error.message);
      return this.getFallbackContent(input);
    }
  }

  private buildPrompt(input: ContentInput): string {
    const locationContext = input.isFferryCrossing
      ? `crossing by ferry near ${input.placeName}, ${input.region}, ${input.country}`
      : `visiting ${input.placeName}, ${input.region}, ${input.country}`;

    return `I'm ${locationContext} on my journey around the world on foot.

Research about this place:
${input.researchSummary}

Generate the following in JSON format:
1. "imagePrompt": A detailed DALL-E prompt for a documentary-style black & white photograph of this location. Include mood, lighting, composition, and photographic style (inspired by Magnum photographers). Also specify realistic camera metadata.
2. "narrative": A short first-person reflection (100-150 words) about this moment in the journey, inspired by Magnum photographers' documentary style.
3. "cameraMetadata": Realistic camera settings as JSON with fields: camera (Leica model), lens, iso, shutterSpeed, aperture.

Return ONLY valid JSON, no markdown or code blocks.`;
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
    return {
      camera: 'Leica M11',
      lens: '35mm f/1.4',
      iso: 800,
      shutterSpeed: '1/125',
      aperture: 'f/2.8',
    };
  }
}
