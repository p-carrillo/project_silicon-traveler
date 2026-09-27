import axios from 'axios';
import { IBraveSearchPort, SearchOptions, SearchResult } from '../ports/brave-search.port';

interface WikipediaSearchItem {
  title?: string;
  snippet?: string;
  pageid?: number;
  index?: number;
  extract?: string;
  revisions?: Array<{
    slots?: {
      main?: { content?: string };
    };
  }>;
}

interface WikipediaSearchResponse {
  query?: {
    pages?: WikipediaSearchItem[];
  };
}

const WIKIPEDIA_SEARCH_API_URL = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_USER_AGENT =
  process.env.WIKIPEDIA_USER_AGENT || 'silicon-traveler/1.0 (https://github.com)';

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeSnippet(snippet?: string): string {
  if (!snippet) return '';
  const withoutTags = snippet.replace(/<[^>]*>/g, ' ');
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

export class BraveSearchAdapter implements IBraveSearchPort {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.WIKIPEDIA_SEARCH_API_URL || WIKIPEDIA_SEARCH_API_URL;
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const response = await this.searchWithDiagnostics(query, limit);
    return response.results;
  }

  async searchWithDiagnostics(query: string, limit: number = 5, options?: SearchOptions): Promise<{ results: SearchResult[]; error?: string }> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return { results: [] };

    const safeLimit = Math.max(1, Math.min(limit, 10));
    try {
      const response = await axios.get<WikipediaSearchResponse>(this.baseUrl, {
        params: {
          action: 'query',
          generator: 'search',
          gsrsearch: normalizedQuery,
          gsrnamespace: 0,
          gsrlimit: safeLimit,
          gsrprop: 'snippet',
          prop: options?.includePageContent ? 'extracts|revisions' : 'extracts',
          exchars: 1200,
          explaintext: 1,
          ...(options?.includePageContent ? { rvprop: 'content', rvslots: 'main' } : {}),
          format: 'json',
          formatversion: 2,
          utf8: 1,
        },
        headers: { 'User-Agent': WIKIPEDIA_USER_AGENT, Accept: 'application/json' },
        timeout: 10000,
      });
      const pages = response.data.query?.pages ?? [];
      const results = [...pages].sort((left, right) => (left.index ?? Number.MAX_SAFE_INTEGER) - (right.index ?? Number.MAX_SAFE_INTEGER));
      return {
        results: results.map((result) => {
          const title = typeof result.title === 'string' ? result.title : '';
          const description = normalizeSnippet(result.snippet);
          const hasPageId = Number.isFinite(result.pageid);
          const url = hasPageId
            ? 'https://en.wikipedia.org/?curid=' + result.pageid
            : 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/\s+/g, '_'));
          const text = typeof result.extract === 'string' ? result.extract.trim() : '';
          const content = result.revisions?.[0]?.slots?.main?.content?.trim();
          return { title, description, url, ...(text ? { text } : {}), ...(content ? { content } : {}) };
        }),
      };
    } catch (error: unknown) {
      const details = searchErrorDetails(error);
      console.error('Wikipedia Search API error:', details);
      return { results: [], error: details };
    }
  }
}

function searchErrorDetails(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const code = error.code;
    return [
      'Wikipedia search request failed',
      status ? 'HTTP ' + status + (statusText ? ' ' + statusText : '') : null,
      code || null,
      error.message || null,
    ].filter((part): part is string => Boolean(part)).join(' — ');
  }
  return error instanceof Error && error.message ? error.message : 'Unknown Wikipedia search error';
}
