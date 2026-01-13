import { JourneyEntry } from '../entities/journey-entry.entity';

export interface IJourneyEntryRepository {
  create(entry: JourneyEntry): Promise<JourneyEntry>;
  findByJourneyIdAndDate(journeyId: string, travelDate: string): Promise<JourneyEntry | null>;
  findByJourneyId(
    journeyId: string,
    options?: { month?: string; limit?: number; offset?: number },
  ): Promise<JourneyEntry[]>;
  findLatestByJourneyId(journeyId: string): Promise<JourneyEntry | null>;
  countByJourneyId(journeyId: string): Promise<number>;
}
