import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReorderJourneyStopsCommand } from './reorder-journey-stops.command';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';

@CommandHandler(ReorderJourneyStopsCommand)
export class ReorderJourneyStopsHandler
  implements ICommandHandler<ReorderJourneyStopsCommand>
{
  constructor(
    @Inject('IJourneyRepository')
    private readonly journeyRepository: IJourneyRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
  ) {}

  async execute(
    command: ReorderJourneyStopsCommand,
  ): Promise<JourneyStop[] | null> {
    const journey = await this.journeyRepository.findById(command.journeyId);

    if (!journey) {
      return null;
    }

    const stops = await this.stopRepository.findByJourneyId(command.journeyId);
    const stopIds = new Set(stops.map((stop) => stop.id));

    if (command.orderedStopIds.length !== stops.length) {
      throw new Error('Stop order does not include all stops.');
    }

    for (const stopId of command.orderedStopIds) {
      if (!stopIds.has(stopId)) {
        throw new Error('Stop order includes invalid stop IDs.');
      }
    }

    await this.stopRepository.updateSequences(
      command.journeyId,
      command.orderedStopIds,
    );

    return this.stopRepository.findByJourneyId(command.journeyId);
  }
}
