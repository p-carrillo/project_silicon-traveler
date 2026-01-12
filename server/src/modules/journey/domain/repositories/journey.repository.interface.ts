import { Journey, JourneyStatus } from '../entities/journey.entity';

export interface IJourneyRepository {
  create(journey: Journey): Promise<Journey>;
  findById(id: string): Promise<Journey | null>;
  findActive(): Promise<Journey[]>;
  updateStatus(id: string, status: JourneyStatus): Promise<void>;
}
