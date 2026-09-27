export interface SearchResult {
  title: string;
  description: string;
  url: string;
  text?: string;
  content?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  error?: string;
}

export interface SearchOptions {
  includePageContent?: boolean;
}

export type ResearchSummaryLanguage = 'en' | 'es';

export interface ResearchSummaryInput {
  placeName: string;
  language: ResearchSummaryLanguage;
  sources: Array<{ title: string; text: string }>;
}

export interface IResearchSummaryPort {
  summarizeResearch(input: ResearchSummaryInput): Promise<string>;
}

export interface IBraveSearchPort {
  search(query: string, limit?: number): Promise<SearchResult[]>;
  searchWithDiagnostics?(query: string, limit?: number, options?: SearchOptions): Promise<SearchResponse>;
}
