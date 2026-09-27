import { IJourneyRepository } from '../ports/journey-repository.port';
import { Point } from '@silicon-traveler/shared';

export class UpdateJourneyPositionUseCase {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(journeyId: number, newPosition: Point): Promise<void> {
    const journey = await this.journeyRepository.findById(journeyId);
    if (!journey) {
      throw new Error(`Journey with id ${journeyId} not found`);
    }

    journey.updatePosition(newPosition);
    await this.journeyRepository.update(journey);
  }
}
