import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListJourneysQuery } from './list-journeys.query';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { Journey } from '../../domain/entities/journey.entity';

@QueryHandler(ListJourneysQuery)
export class ListJourneysHandler implements IQueryHandler<ListJourneysQuery> {
  constructor(
    @Inject('IJourneyRepository')
    private readonly repository: IJourneyRepository,
  ) {}

  async execute(_query: ListJourneysQuery): Promise<Journey[]> {
    return this.repository.findAll();
  }
}
