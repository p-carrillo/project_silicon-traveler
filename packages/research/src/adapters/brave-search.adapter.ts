import axios from 'axios';
import { IBraveSearchPort, SearchResult } from '../ports/brave-search.port';

export class BraveSearchAdapter implements IBraveSearchPort {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRAVE_API_KEY || '';
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn('Brave API key not set, returning empty results');
      return [];
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          count: limit,
        },
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': this.apiKey,
        },
        timeout: 10000,
      });

      const results = response.data.web?.results || [];
      
      return results.map((r: any) => ({
        title: r.title || '',
        description: r.description || '',
        url: r.url || '',
      }));
    } catch (error: any) {
      console.error('Brave Search API error:', error.message);
      return [];
    }
  }
}
