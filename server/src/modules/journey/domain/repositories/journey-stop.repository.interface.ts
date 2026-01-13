import { JourneyStop } from '../entities/journey-stop.entity';

export interface IJourneyStopRepository {
  create(stop: JourneyStop): Promise<JourneyStop>;
  findById(id: string): Promise<JourneyStop | null>;
  findByJourneyId(journeyId: string): Promise<JourneyStop[]>;
  findByJourneyIdAndSequence(journeyId: string, sequence: number): Promise<JourneyStop | null>;
  update(stop: JourneyStop): Promise<JourneyStop>;
  updateSequences(journeyId: string, orderedStopIds: string[]): Promise<void>;
}
