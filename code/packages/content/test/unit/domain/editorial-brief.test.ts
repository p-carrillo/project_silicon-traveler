import { describe, expect, it } from 'vitest';
import { DEFAULT_EDITORIAL_GENERATION_CONFIG } from '../../../src/config/editorial';
import {
  buildEditorialBrief,
  evaluateEditorialNarrative,
  selectNarrativeMode,
} from '../../../src/domain/editorial-brief';

const researchedSummary =
  'Pamplona is the capital city of Navarre in northern Spain. The Arga River crosses the city near its historic centre.';

function buildBrief(overrides: Partial<Parameters<typeof buildEditorialBrief>[0]> = {}) {
  return buildEditorialBrief({
    placeName: 'Pamplona',
    region: 'Navarre',
    country: 'Spain',
    researchSummary: researchedSummary,
    sequence: 5,
    coordinates: { lat: 42.8125, lng: -1.6458 },
    distanceFromPrevious: 23.4,
    recentNarratives: ['The stone bridge leads toward the station as the route enters the city.'],
    config: DEFAULT_EDITORIAL_GENERATION_CONFIG,
    ...overrides,
  });
}

describe('buildEditorialBrief', () => {
  it('selects a research-backed fact, material detail, varied mode and recent phrase constraints', () => {
    const brief = buildBrief();

    expect(brief.factualAnchor).toContain('capital city of Navarre');
    expect(brief.visualMaterialAnchor).toContain('Arga River');
    expect(brief.narrativeMode).toBe('movement');
    expect(brief.bannedRecentPhrases.join(' ')).toContain('stone bridge leads');
    expect(brief.researchSupported).toBe(true);
  });

  it('uses only route facts and labels the mode as route observation when research is empty', () => {
    const brief = buildBrief({
      researchSummary: '',
      verifiedGeographicObservations: ['OpenStreetMap maps Pamplona as a city.'],
    });

    expect(brief.researchSupported).toBe(false);
    expect(brief.narrativeMode).toBe('route-observation');
    expect(brief.factualAnchor).toContain('Pamplona');
    expect(brief.factualAnchor).toContain('Navarre');
    expect(brief.visualMaterialAnchor).toContain('OpenStreetMap maps Pamplona as a city.');
    expect(brief.visualMaterialAnchor).toContain('42.813, -1.646');
    expect(brief.factualAnchor).not.toContain('Unknown');
  });
});

describe('selectNarrativeMode', () => {
  it('avoids every mode used in the configured recent window', () => {
    const recent = [
      selectNarrativeMode(7, 0),
      selectNarrativeMode(6, 0),
      selectNarrativeMode(5, 0),
    ];

    expect(selectNarrativeMode(8, 3)).not.toBe(recent[0]);
    expect(selectNarrativeMode(8, 3)).not.toBe(recent[1]);
    expect(selectNarrativeMode(8, 3)).not.toBe(recent[2]);
  });
});

describe('evaluateEditorialNarrative', () => {
  it('accepts a grounded, distinct narrative', () => {
    const result = evaluateEditorialNarrative(
      'Pamplona is Navarre’s capital, and the Arga River crosses the city beside its historic centre. I follow that waterline through the route notes, where geography gives this entry its shape.',
      buildBrief(),
      ['The stone bridge leads toward the station as the route enters the city.']
    );

    expect(result.accepted).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('rejects missing factual anchors, clichés, and heavy overlap with recent entries', () => {
    const generic = evaluateEditorialNarrative(
      'The silence speaks across a timeless landscape. I feel the vastness here, where echoes of the past move through memory.',
      buildBrief(),
      []
    );
    const repeated = evaluateEditorialNarrative(
      researchedSummary,
      buildBrief({ recentNarratives: [researchedSummary] }),
      [researchedSummary]
    );

    expect(generic.accepted).toBe(false);
    expect(generic.reasons.join(' ')).toContain('concrete fact from the anchor');
    expect(generic.reasons.join(' ')).toContain('generic contemplative');
    expect(repeated.reasons.join(' ')).toContain('high wording overlap');
  });
});
