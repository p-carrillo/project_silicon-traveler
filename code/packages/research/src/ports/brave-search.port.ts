export interface SearchResult {
  title: string;
  description: string;
  url: string;
}

export interface IBraveSearchPort {
  search(query: string, limit?: number): Promise<SearchResult[]>;
}
