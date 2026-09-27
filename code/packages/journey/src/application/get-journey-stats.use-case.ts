import { IJourneyRepository } from '../ports/journey-repository.port';

export interface JourneyStats {
  totalDays: number;
  currentCountry: string;
  currentRegion: string;
  totalDistanceKm: number;
}

export class GetJourneyStatsUseCase {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(): Promise<JourneyStats | null> {
    const journey = await this.journeyRepository.findActive();
    if (!journey) {
      return null;
    }

    const totalDays = Math.floor(
      (Date.now() - journey.startedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Note: Country and distance would come from route_points in a real implementation
    // This is simplified for now
    return {
      totalDays,
      currentCountry: 'Spain', // Placeholder
      currentRegion: 'Galicia', // Placeholder
      totalDistanceKm: 0, // Placeholder
    };
  }
}
