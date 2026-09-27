import type { IBraveSearchPort, SearchOptions, SearchResponse } from '../ports/brave-search.port';

export interface ResearchPlaceResult {
  query: string;
  summary: string;
  sources: Array<{ title: string; url: string; text?: string; content?: string }>;
  error?: string;
}

export function buildPlaceResearchQuery(location: string): string {
  return location.trim();
}

export class ResearchPlaceUseCase {
  constructor(private readonly braveSearchPort: IBraveSearchPort) {}

  async execute(placeName: string, country: string): Promise<string> {
    const research = await this.lookup(placeName);
    if (research.failed) return 'Failed to research ' + placeName + ', ' + country + '.';
    if (research.results.length === 0) return 'No information found about ' + placeName + ', ' + country + '.';
    return research.results
      .map((result, index) => (index + 1) + '. ' + result.title + ': ' + result.description)
      .join('\n\n');
  }

  async executeForPlace(location: string, options?: SearchOptions): Promise<ResearchPlaceResult> {
    const research = await this.lookup(location.trim(), options);
    return {
      query: research.query,
      summary: research.summary,
      sources: research.results.map(({ title, url, text, content }) => ({ title, url, ...(text ? { text } : {}), ...(content ? { content } : {}) })),
      ...(research.error ? { error: research.error } : {}),
    };
  }

  private async lookup(location: string, options?: SearchOptions) {
    try {
      const query = buildPlaceResearchQuery(location);
      const response: SearchResponse = this.braveSearchPort.searchWithDiagnostics
        ? options
          ? await this.braveSearchPort.searchWithDiagnostics(query, 3, options)
          : await this.braveSearchPort.searchWithDiagnostics(query, 3)
        : { results: await this.braveSearchPort.search(query, 3) };
      return {
        query,
        results: response.results,
        failed: Boolean(response.error),
        ...(response.error ? { error: response.error } : {}),
        summary: response.results.map((result) => result.description).join(' '),
      };
    } catch (error: unknown) {
      const message = error instanceof Error && error.message ? error.message : 'Unknown research provider error';
      console.error('Research error:', message);
      return { query: buildPlaceResearchQuery(location), results: [], failed: true, summary: '', error: message };
    }
  }
}
