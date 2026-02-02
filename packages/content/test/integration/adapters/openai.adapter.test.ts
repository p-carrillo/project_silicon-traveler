import { describe, it, expect } from 'vitest';
import { OpenAIAdapter } from '../../../src/adapters/openai.adapter';

describe('OpenAIAdapter (integration)', () => {
  it('parses JSON responses into structured content', () => {
    const adapter = new OpenAIAdapter('test-key');
    const response = JSON.stringify({
      imagePrompt: 'Prompt',
      narrative: 'Narrative',
      cameraMetadata: {
        camera: 'Leica M11',
        lens: '35mm',
        iso: 400,
        shutterSpeed: '1/250',
        aperture: 'f/2.8',
      },
    });

    const parsed = (adapter as any).parseResponse(response);

    expect(parsed.imagePrompt).toBe('Prompt');
    expect(parsed.narrative).toBe('Narrative');
    expect(parsed.cameraMetadata.camera).toBe('Leica M11');
  });
});
