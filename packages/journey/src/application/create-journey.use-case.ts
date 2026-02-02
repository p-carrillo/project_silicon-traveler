import { IJourneyRepository } from '../ports/journey-repository.port';
import { Journey } from '../domain/journey.entity';
import { Point } from '@silicon-traveler/shared';

export class CreateJourneyUseCase {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(name: string, originPoint: Point, heading: string = 'east'): Promise<Journey> {
    const journeyData = Journey.create(name, originPoint, heading);
    return await this.journeyRepository.create(journeyData);
  }
}
