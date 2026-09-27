import { describe, expect, it } from 'vitest';
import { buildImagePrompt, buildResearchSummaryPrompt } from '../../../src/prompts/content-prompts';
import { buildVisualBrief } from '../../../src/domain/visual-brief';

describe('buildImagePrompt', () => {
  it('uses the reflection and leaves human depiction choices open', () => {
    const visualBrief = buildVisualBrief({ placeName: 'A Coruna', factualAnchor: 'Residents live in A Coruna.', visualMaterialAnchor: 'Residents live in the community.', researchSupported: true, sequence: 0 });
    const prompt = buildImagePrompt({
      visualBrief,
      placeName: 'A Coruna',
      region: 'Galicia',
      country: 'Spain',
      reflection: 'I notice the railway entering the city.',
      language: 'en',
    });

    expect(visualBrief.category).toBe('human-presence');
    expect(prompt).toContain('I notice the railway entering the city.');
    expect(prompt).toContain('Kodak Tri-X 400');
    expect(prompt).toContain('50mm lens');
    expect(prompt).toContain('pronounced visible film grain');
    expect(prompt).toContain('depict a local resident');
    expect(prompt).toContain('Avoid the recurring young man with a backpack');
    expect(prompt).toContain('Let apparent ethnicity, skin tone, gender presentation, age, expression, and posture follow the mood');
    expect(prompt).toContain('unverified traditional clothing');
    expect(prompt).not.toContain('gender:');
    expect(prompt).not.toContain('age:');
    expect(prompt).not.toContain('shotType:');
    expect(prompt).not.toContain('expression:');
    expect(prompt).not.toContain('gaze:');
  });

  it('keeps scene anchors for non-human scenes without injecting portrait recipes', () => {
    const visualBrief = buildVisualBrief({ placeName: 'Pamplona', factualAnchor: 'The Arga River crosses Pamplona.', visualMaterialAnchor: 'The Arga River crosses the city.', researchSupported: true, sequence: 0 });
    const prompt = buildImagePrompt({
      visualBrief, placeName: 'Pamplona', region: 'Navarre', country: 'Spain',
      reflection: 'The river crosses my path.', language: 'en',
    });
    expect(prompt).toContain('The Arga River crosses the city.');
    expect(prompt).not.toContain('Portrait parameters');
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
