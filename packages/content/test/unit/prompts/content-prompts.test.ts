import { describe, expect, it } from 'vitest';
import { buildImagePrompt } from '../../../src/prompts/content-prompts';

describe('buildImagePrompt', () => {
  it('does not include background in inline portrait parameters', () => {
    const prompt = buildImagePrompt({
      portraitParameters: {
        gender: 'woman',
        age: 34,
        incomeClass: 'middle class',
        shotType: 'close-up',
        expression: 'pensive',
        gaze: 'looking away',
        facingDirection: 'right',
        posture: 'standing',
        timeOfDay: 'dusk',
        activity: 'waiting',
        lightingContrast: 'high contrast',
        filmGrain: 'medium',
        cameraHeight: 'eye level',
        depthOfField: 'shallow',
      },
      placeName: 'A Coruna',
      region: 'Galicia',
      country: 'Spain',
      language: 'es',
    });

    expect(prompt).not.toContain('background:');
    expect(prompt).not.toContain('fondo:');
    expect(prompt).toContain('facingDirection: looking to the right');
  });
});
