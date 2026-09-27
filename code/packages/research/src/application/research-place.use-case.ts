import type { IResearchSummaryPort, IBraveSearchPort, ResearchSummaryLanguage, SearchOptions, SearchResponse, SearchResult } from '../ports/brave-search.port';

export interface ResearchPlaceResult {
  query: string;
  summary: string;
  sources: Array<{ title: string; url: string; text?: string; content?: string }>;
  error?: string;
  summaryError?: string;
}

export interface ResearchPlaceOptions extends SearchOptions {
  summaryLanguage?: ResearchSummaryLanguage;
}

export function buildPlaceResearchQuery(location: string): string {
  return location.trim();
}

export class ResearchPlaceUseCase {
  constructor(
    private readonly searchPort: IBraveSearchPort,
    private readonly summaryPort: IResearchSummaryPort
  ) {}

  async execute(placeName: string, country: string, summaryLanguage: ResearchSummaryLanguage = 'en'): Promise<string> {
    const result = await this.executeForPlace(placeName, { summaryLanguage });
    if (result.error) return 'Failed to research ' + placeName + ', ' + country + '.';
    if (!result.summary) return 'No information found about ' + placeName + ', ' + country + '.';
    return result.summary;
  }

  async executeForPlace(location: string, options: ResearchPlaceOptions = {}): Promise<ResearchPlaceResult> {
    const research = await this.lookup(location.trim(), options);
    const { summary, summaryError } = research.error
      ? { summary: '', summaryError: undefined }
      : await this.summarize(location.trim(), research.results, options.summaryLanguage ?? 'en');

    return {
      query: research.query,
      summary,
      sources: research.results.map(({ title, url, text, content }) => ({ title, url, ...(text ? { text } : {}), ...(content ? { content } : {}) })),
      ...(research.error ? { error: research.error } : {}),
      ...(summaryError ? { summaryError } : {}),
    };
  }

  private async lookup(location: string, options: ResearchPlaceOptions) {
    const query = buildPlaceResearchQuery(location);
    try {
      const searchOptions: SearchOptions = { includePageContent: options.includePageContent ?? true };
      const response: SearchResponse = this.searchPort.searchWithDiagnostics
        ? await this.searchPort.searchWithDiagnostics(query, 3, searchOptions)
        : { results: await this.searchPort.search(query, 3) };
      return { query, results: response.results, ...(response.error ? { error: response.error } : {}) };
    } catch (error: unknown) {
      const message = error instanceof Error && error.message ? error.message : 'Unknown research provider error';
      console.error('Research error:', message);
      return { query, results: [] as SearchResult[], error: message };
    }
  }

  private async summarize(location: string, results: SearchResult[], language: ResearchSummaryLanguage): Promise<{ summary: string; summaryError?: string }> {
    const sources = results
      .map((result) => ({ title: result.title, text: result.content?.trim() || result.text?.trim() || result.description.trim() }))
      .filter((source) => source.text.length > 0);
    if (!sources.length) return { summary: '' };

    try {
      const summary = await this.summaryPort.summarizeResearch({ placeName: location, language, sources });
      if (!summary.trim()) throw new Error('The LLM returned an empty research summary');
      return { summary: summary.trim() };
    } catch (error: unknown) {
      const summaryError = error instanceof Error && error.message ? error.message : 'Unknown LLM research summary error';
      console.error('Research summary error:', summaryError);
      const fallback = results.map((result) => result.text?.trim() || result.description.trim()).filter(Boolean).join(' ');
      return { summary: fallback, summaryError };
    }
  }
}
