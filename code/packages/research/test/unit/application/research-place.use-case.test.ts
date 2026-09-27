import { describe, it, expect } from 'vitest';
import { buildPlaceResearchQuery, ResearchPlaceUseCase } from '../../../src/application/research-place.use-case';
import type { ResearchSummaryInput } from '../../../src/ports/brave-search.port';

describe('ResearchPlaceUseCase', () => {
  it('returns the LLM summary of search results', async () => {
    const searchPort = {
      search: async () => [
        { title: 'A', description: 'Alpha', url: 'http://a' },
        { title: 'B', description: 'Beta', url: 'http://b' },
      ],
    };
    const summaryPort = {
      summarizeResearch: async ({ sources }: ResearchSummaryInput) => sources.map((source, index) => (index + 1) + '. ' + source.title + ': ' + source.text).join('\n'),
    };
    const useCase = new ResearchPlaceUseCase(searchPort, summaryPort);

    const summary = await useCase.execute('Test', 'Country');

    expect(summary).toContain('1. A: Alpha');
    expect(summary).toContain('2. B: Beta');
  });

  it('returns a fallback when no search results exist', async () => {
    const searchPort = { search: async () => [] };
    const summaryPort = { summarizeResearch: async () => 'should not run' };
    const useCase = new ResearchPlaceUseCase(searchPort, summaryPort);

    const summary = await useCase.execute('Test', 'Country');

    expect(summary).toBe('No information found about Test, Country.');
  });

  it('searches Wikipedia using only the city name', async () => {
    const queries: string[] = [];
    const searchPort = {
      search: async (query: string) => { queries.push(query); return []; },
    };
    const summaryPort = { summarizeResearch: async () => 'summary' };
    const useCase = new ResearchPlaceUseCase(searchPort, summaryPort);

    await useCase.execute('Pamplona', 'Spain');

    expect(queries).toEqual(['Pamplona']);
  });

  it('passes complete page content to the summarizer in the requested language', async () => {
    let summaryInput: ResearchSummaryInput | undefined;
    let includePageContent: boolean | undefined;
    const searchPort = {
      searchWithDiagnostics: async (_query: string, _limit: number, options?: { includePageContent?: boolean }) => {
        includePageContent = options?.includePageContent;
        return { results: [
          { title: 'Pamplona', description: 'An old city', url: 'https://example.test/pamplona', text: 'short extract', content: 'complete wiki article' },
          { title: 'History of Pamplona', description: 'Its history', url: 'https://example.test/history', text: 'history extract', content: 'complete history article' },
        ] };
      },
    };
    const summaryPort = { summarizeResearch: async (input: ResearchSummaryInput) => { summaryInput = input; return 'Resumen LLM'; } };
    const useCase = new ResearchPlaceUseCase(searchPort, summaryPort);

    const result = await useCase.executeForPlace('Pamplona', { summaryLanguage: 'es' });

    expect(includePageContent).toBe(true);
    expect(summaryInput).toEqual({ placeName: 'Pamplona', language: 'es', sources: [{ title: 'Pamplona', text: 'complete wiki article' }, { title: 'History of Pamplona', text: 'complete history article' }] });
    expect(result.summary).toBe('Resumen LLM');
    expect(result.sources[0].content).toBe('complete wiki article');
  });

  it('keeps extract fallback text and reports an LLM summary error', async () => {
    const searchPort = {
      search: async () => [{ title: 'Pamplona', description: 'snippet', url: 'https://example.test', text: 'plain text extract' }],
    };
    const summaryPort = { summarizeResearch: async () => { throw new Error('OpenAI unavailable'); } };
    const useCase = new ResearchPlaceUseCase(searchPort, summaryPort);

    const result = await useCase.executeForPlace('Pamplona');

    expect(result.summary).toBe('plain text extract');
    expect(result.summaryError).toBe('OpenAI unavailable');
  });

  it('uses the trimmed city name as the exact Wikipedia query', () => {
    expect(buildPlaceResearchQuery('  Pamplona  ')).toBe('Pamplona');
  });
});
