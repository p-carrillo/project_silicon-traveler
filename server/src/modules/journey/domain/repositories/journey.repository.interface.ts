import { Journey, JourneyStatus } from '../entities/journey.entity';

export interface IJourneyRepository {
  create(journey: Journey): Promise<Journey>;
  findAll(): Promise<Journey[]>;
  findById(id: string): Promise<Journey | null>;
  findActive(): Promise<Journey[]>;
  update(journey: Journey): Promise<Journey>;
  updateStatus(id: string, status: JourneyStatus): Promise<void>;
}
