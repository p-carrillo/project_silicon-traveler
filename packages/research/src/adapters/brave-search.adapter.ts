import axios from 'axios';
import { IBraveSearchPort, SearchResult } from '../ports/brave-search.port';

interface WikipediaSearchItem {
  title?: string;
  snippet?: string;
  pageid?: number;
}

interface WikipediaSearchResponse {
  query?: {
    search?: WikipediaSearchItem[];
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
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    const safeLimit = Math.max(1, Math.min(limit, 10));

    try {
      const response = await axios.get<WikipediaSearchResponse>(this.baseUrl, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: normalizedQuery,
          srlimit: safeLimit,
          format: 'json',
          utf8: 1,
        },
        headers: {
          'User-Agent': WIKIPEDIA_USER_AGENT,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      const results = response.data.query?.search ?? [];

      return results.map((result) => {
        const title = typeof result.title === 'string' ? result.title : '';
        const description = normalizeSnippet(result.snippet);
        const hasPageId = Number.isFinite(result.pageid);
        const url = hasPageId
          ? `https://en.wikipedia.org/?curid=${result.pageid}`
          : `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;

        return {
          title,
          description,
          url,
        };
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Wikipedia Search API error:', message);
      return [];
    }
  }
}
