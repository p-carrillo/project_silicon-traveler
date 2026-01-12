import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetJourneyQuery } from './get-journey.query';
import { Journey } from '../../domain/entities/journey.entity';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';

export interface JourneyDetails {
  journey: Journey;
  stops: JourneyStop[];
}

@QueryHandler(GetJourneyQuery)
export class GetJourneyHandler implements IQueryHandler<GetJourneyQuery> {
  constructor(
    @Inject('IJourneyRepository')
    private readonly journeyRepository: IJourneyRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
  ) {}

  async execute(query: GetJourneyQuery): Promise<JourneyDetails | null> {
    const journey = await this.journeyRepository.findById(query.id);

    if (!journey) {
      return null;
    }

    const stops = await this.stopRepository.findByJourneyId(query.id);

    return {
      journey,
      stops: [...stops].sort((a, b) => a.sequence - b.sequence),
    };
  }
}
