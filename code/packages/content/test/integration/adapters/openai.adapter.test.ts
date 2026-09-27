import { describe, it, expect } from 'vitest';
import { OpenAIAdapter } from '../../../src/adapters/openai.adapter';

describe('OpenAIAdapter (integration)', () => {
  describe('parseNarrative', () => {
    it('parses plain text narrative', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = 'This is a narrative about a place.';

      const parsed = (adapter as any).parseNarrative(response);

      expect(parsed).toBe('This is a narrative about a place.');
    });

    it('removes markdown code blocks from response', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = '```\nThis is a narrative.\n```';

      const parsed = (adapter as any).parseNarrative(response);

      expect(parsed).toBe('This is a narrative.');
    });

    it('removes surrounding quotes from response', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = '"This is a narrative."';

      const parsed = (adapter as any).parseNarrative(response);

      expect(parsed).toBe('This is a narrative.');
    });

    it('returns fallback for empty response', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = '';

      const parsed = (adapter as any).parseNarrative(response);

      expect(parsed).toBe('Another day on the road.');
    });
  });

  describe('parseTranslationResponse', () => {
    it('parses JSON translation response', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = JSON.stringify({
        imagePrompt: 'Translated image prompt',
        narrative: 'Translated narrative',
      });
      const input = {
        sourceLanguage: 'en',
        targetLanguage: 'es',
        narrative: 'Original narrative',
        imagePrompt: 'Original image prompt',
      };

      const parsed = (adapter as any).parseTranslationResponse(response, input);

      expect(parsed.imagePrompt).toBe('Translated image prompt');
      expect(parsed.narrative).toBe('Translated narrative');
    });

    it('handles markdown JSON response', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = '```json\n{"imagePrompt": "Test", "narrative": "Test narrative"}\n```';
      const input = {
        sourceLanguage: 'en',
        targetLanguage: 'es',
        narrative: 'Original',
        imagePrompt: 'Original',
      };

      const parsed = (adapter as any).parseTranslationResponse(response, input);

      expect(parsed.imagePrompt).toBe('Test');
      expect(parsed.narrative).toBe('Test narrative');
    });

    it('returns fallback on parse error', () => {
      const adapter = new OpenAIAdapter('test-key');
      const response = 'Invalid JSON';
      const input = {
        sourceLanguage: 'en',
        targetLanguage: 'es',
        narrative: 'Fallback narrative',
        imagePrompt: 'Fallback prompt',
      };

      const parsed = (adapter as any).parseTranslationResponse(response, input);

      expect(parsed.imagePrompt).toBe('Fallback prompt');
      expect(parsed.narrative).toBe('Fallback narrative');
    });
  });
});
