import { Injectable } from '@nestjs/common';
import { ITextGenerator, TextGenerationResult } from '../../domain/ports/text-generator.interface';

@Injectable()
export class OpenAiTextGenerator implements ITextGenerator {
  async generateText(prompt: string, model: string): Promise<TextGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing.');
    }

    const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenAI text generation failed with status ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI text generation returned no content.');
    }

    return {
      text: content,
      model,
    };
  }
}
