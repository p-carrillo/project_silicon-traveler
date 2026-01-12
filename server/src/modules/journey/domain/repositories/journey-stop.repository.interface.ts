import { JourneyStop } from '../entities/journey-stop.entity';

export interface IJourneyStopRepository {
  create(stop: JourneyStop): Promise<JourneyStop>;
  findByJourneyId(journeyId: string): Promise<JourneyStop[]>;
  findByJourneyIdAndSequence(journeyId: string, sequence: number): Promise<JourneyStop | null>;
  updateSequences(journeyId: string, orderedStopIds: string[]): Promise<void>;
}
