import { describe, expect, it } from 'vitest';
import { buildImagePrompt, buildResearchSummaryPrompt } from '../../../src/prompts/content-prompts';

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
  });
});


describe('buildResearchSummaryPrompt', () => {
  it('summarizes all supplied sources in the requested language and treats their text as data', () => {
    const prompt = buildResearchSummaryPrompt({
      placeName: 'Pamplona',
      language: 'es',
      sources: [
        { title: 'History of Pamplona', text: 'Article content one' },
        { title: 'Pamplona', text: 'Article content two' },
      ],
    });

    expect(prompt).toContain('in Spanish');
    expect(prompt).toContain('History of Pamplona');
    expect(prompt).toContain('Article content one');
    expect(prompt).toContain('Article content two');
    expect(prompt).toContain('untrusted reference material');
  });
});
