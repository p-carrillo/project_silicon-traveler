import { IBraveSearchPort } from '../ports/brave-search.port';

export class ResearchPlaceUseCase {
  constructor(private readonly braveSearchPort: IBraveSearchPort) {}

  async execute(placeName: string, country: string): Promise<string> {
    const query = `${placeName} ${country} history culture tourism`;
    
    try {
      const results = await this.braveSearchPort.search(query, 3);
      
      if (results.length === 0) {
        return `No information found about ${placeName}, ${country}.`;
      }
      
      // Combine top results into summary
      const summary = results
        .map((r, i) => `${i + 1}. ${r.title}: ${r.description}`)
        .join('\n\n');
      
      return summary;
    } catch (error) {
      console.error('Research error:', error);
      return `Failed to research ${placeName}, ${country}.`;
    }
  }
}
