import { Journey } from '../domain/journey.entity';

export interface IJourneyRepository {
  create(journey: Omit<Journey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Journey>;
  findById(id: number): Promise<Journey | null>;
  findActive(): Promise<Journey | null>;
  update(journey: Journey): Promise<void>;
}
