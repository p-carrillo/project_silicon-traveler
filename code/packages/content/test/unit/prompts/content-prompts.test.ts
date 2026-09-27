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

describe('buildNarrativePrompt', () => {
  it('uses the editorial brief and feedback to ground a varied narrative', async () => {
    const { buildNarrativePrompt } = await import('../../../src/prompts/content-prompts');
    const prompt = buildNarrativePrompt({
      placeName: 'Pamplona',
      country: 'Spain',
      region: 'Navarre',
      researchSummary: 'Pamplona is the capital city of Navarre in northern Spain.',
      language: 'en',
      editorialBrief: {
        placeName: 'Pamplona',
        factualAnchor: 'Pamplona is the capital city of Navarre in northern Spain.',
        requiredFactTokens: ['capital'],
        visualMaterialAnchor: 'The Arga River crosses the city.',
        narrativeMode: 'local-history',
        bannedRecentPhrases: ['stone bridge leads'],
        researchSupported: true,
      },
      qualityFeedback: ['The narrative does not include the factual anchor.'],
    });

    expect(prompt).toContain('Narrative mode: local-history');
    expect(prompt).toContain('Factual anchor: Pamplona is the capital city');
    expect(prompt).toContain('Avoid reusing these recent phrases: stone bridge leads.');
    expect(prompt).toContain('Regeneration feedback');
    expect(prompt).toContain('Do not invent facts or local customs');
  });

  it('keeps an empty-research prompt limited to the verified route brief', async () => {
    const { buildNarrativePrompt } = await import('../../../src/prompts/content-prompts');
    const prompt = buildNarrativePrompt({
      placeName: 'Pamplona',
      country: 'Spain',
      region: 'Navarre',
      researchSummary: '',
      editorialBrief: {
        placeName: 'Pamplona',
        factualAnchor: 'Pamplona, Navarre, Spain',
        requiredFactTokens: ['Navarre'],
        visualMaterialAnchor: 'coordinates 42.813, -1.646',
        narrativeMode: 'route-observation',
        bannedRecentPhrases: [],
        researchSupported: false,
      },
    });

    expect(prompt).toContain('No research summary is available');
    expect(prompt).toContain('route-observation only');
    expect(prompt).toContain('Do not invent facts or local customs');
  });
});
