import { describe, it, expect } from 'vitest';
import { ResearchPlaceUseCase } from '../../../src/application/research-place.use-case';

describe('ResearchPlaceUseCase', () => {
  it('returns a summary of results', async () => {
    const searchPort = {
      search: async () => [
        { title: 'A', description: 'Alpha', url: 'http://a' },
        { title: 'B', description: 'Beta', url: 'http://b' },
      ],
    };

    const useCase = new ResearchPlaceUseCase(searchPort as any);
    const summary = await useCase.execute('Test', 'Country');

    expect(summary).toContain('1. A: Alpha');
    expect(summary).toContain('2. B: Beta');
  });

  it('returns fallback when no results', async () => {
    const searchPort = {
      search: async () => [],
    };

    const useCase = new ResearchPlaceUseCase(searchPort as any);
    const summary = await useCase.execute('Test', 'Country');

    expect(summary).toContain('No information found about Test, Country.');
  });
});
