import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListJourneyEntriesQuery } from './list-journey-entries.query';
import { IJourneyEntryRepository } from '../../domain/repositories/journey-entry.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';
import { JourneyEntryDetails } from './journey-entry-details.type';

@QueryHandler(ListJourneyEntriesQuery)
export class ListJourneyEntriesHandler
  implements IQueryHandler<ListJourneyEntriesQuery>
{
  constructor(
    @Inject('IJourneyEntryRepository')
    private readonly entryRepository: IJourneyEntryRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
  ) {}

  async execute(
    query: ListJourneyEntriesQuery,
  ): Promise<JourneyEntryDetails[]> {
    const entries = await this.entryRepository.findByJourneyId(
      query.journeyId,
      {
        month: query.month,
        limit: query.limit,
        offset: query.offset,
      },
    );

    if (entries.length === 0) {
      return [];
    }

    const stops = await this.stopRepository.findByJourneyId(query.journeyId);
    const stopMap = new Map(stops.map((stop) => [stop.id, stop]));

    return entries.map((entry) => ({
      entry,
      stop: stopMap.get(entry.journeyStopId) ?? null,
    }));
  }
}
