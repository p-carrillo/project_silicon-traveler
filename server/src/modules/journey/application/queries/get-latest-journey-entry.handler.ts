import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLatestJourneyEntryQuery } from './get-latest-journey-entry.query';
import { JourneyEntry } from '../../domain/entities/journey-entry.entity';
import { IJourneyEntryRepository } from '../../domain/repositories/journey-entry.repository.interface';

@QueryHandler(GetLatestJourneyEntryQuery)
export class GetLatestJourneyEntryHandler
  implements IQueryHandler<GetLatestJourneyEntryQuery>
{
  constructor(
    @Inject('IJourneyEntryRepository')
    private readonly entryRepository: IJourneyEntryRepository,
  ) {}

  async execute(query: GetLatestJourneyEntryQuery): Promise<JourneyEntry | null> {
    return this.entryRepository.findLatestByJourneyId(query.journeyId);
  }
}
