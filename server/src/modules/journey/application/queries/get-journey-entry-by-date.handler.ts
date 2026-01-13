import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetJourneyEntryByDateQuery } from './get-journey-entry-by-date.query';
import { IJourneyEntryRepository } from '../../domain/repositories/journey-entry.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';
import { JourneyEntryDetails } from './journey-entry-details.type';

@QueryHandler(GetJourneyEntryByDateQuery)
export class GetJourneyEntryByDateHandler
  implements IQueryHandler<GetJourneyEntryByDateQuery>
{
  constructor(
    @Inject('IJourneyEntryRepository')
    private readonly entryRepository: IJourneyEntryRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
  ) {}

  async execute(
    query: GetJourneyEntryByDateQuery,
  ): Promise<JourneyEntryDetails | null> {
    const entry = await this.entryRepository.findByJourneyIdAndDate(
      query.journeyId,
      query.travelDate,
    );

    if (!entry) {
      return null;
    }

    const stops = await this.stopRepository.findByJourneyId(query.journeyId);
    const stop = stops.find((item) => item.id === entry.journeyStopId) ?? null;

    return { entry, stop };
  }
}
