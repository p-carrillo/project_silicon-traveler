import { describe, expect, it } from 'vitest';
import { buildVisualBrief } from '../../../src/domain/visual-brief';

describe('buildVisualBrief', () => {
  it('chooses a category grounded in the research anchor', () => {
    const brief = buildVisualBrief({
      placeName: 'Pamplona', factualAnchor: 'Pamplona is the capital city of Navarre.',
      visualMaterialAnchor: 'The Arga River crosses the city near its historic centre.',
      researchSupported: true, sequence: 0,
    });
    expect(brief.category).toBe('territory');
    expect(brief.anchor).toBe('The Arga River crosses the city near its historic centre.');
    expect(brief.anchorSource).toBe('research');
  });

  it('cycles among grounded scene categories without imposing a no-repeat rule', () => {
    const input = {
      placeName: 'Pamplona', factualAnchor: 'The river crosses the city by its railway station.',
      visualMaterialAnchor: 'The river crosses the city by its railway station.', researchSupported: true,
    };
    const first = buildVisualBrief({ ...input, sequence: 0 });
    const second = buildVisualBrief({ ...input, sequence: 1 });
    expect(first.category).toBe('territory');
    expect(second.category).toBe('built-environment');
  });

  it('allows a category to repeat when only one grounded category is available', () => {
    const input = { placeName: 'Pamplona', factualAnchor: 'The Arga River runs by Pamplona.', visualMaterialAnchor: 'The Arga River runs by Pamplona.', researchSupported: true };
    expect(buildVisualBrief({ ...input, sequence: 0 }).category).toBe('territory');
    expect(buildVisualBrief({ ...input, sequence: 1 }).category).toBe('territory');
  });

  it('uses a route-grounded movement scene when research has no visual detail', () => {
    const brief = buildVisualBrief({ placeName: 'Pamplona', factualAnchor: 'Pamplona, Navarre, Spain', visualMaterialAnchor: 'coordinates 42.813, -1.646', researchSupported: false, sequence: 0 });
    expect(brief.category).toBe('movement');
    expect(brief.anchorSource).toBe('route');
    expect(brief.setting).toContain('walking route through Pamplona');
    expect(brief.negativeConstraints.join(' ')).toContain('Do not add people');
  });

  it('does not treat a population statistic as evidence for a portrait', () => {
    const brief = buildVisualBrief({ placeName: 'Pamplona', factualAnchor: 'Pamplona has a population of 187000.', visualMaterialAnchor: 'Pamplona has a population of 187000.', researchSupported: true, sequence: 0 });
    expect(brief.category).toBe('movement');
  });

  it('selects human presence only when the source explicitly names people', () => {
    const brief = buildVisualBrief({ placeName: 'Pamplona', factualAnchor: 'Residents cross the old bridge each morning.', visualMaterialAnchor: 'Residents cross the old bridge each morning.', researchSupported: true, sequence: 5 });
    expect(brief.category).toBe('human-presence');
    expect(brief.subject).toContain('local resident');
    expect(brief.visualConstraints.join(' ')).toContain('Make a local inhabitant');
    expect(brief.negativeConstraints.join(' ')).toContain('young backpacker');
  });
});
