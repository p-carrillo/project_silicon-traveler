import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { AddJourneyStopCommand } from './add-journey-stop.command';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';

@CommandHandler(AddJourneyStopCommand)
export class AddJourneyStopHandler
  implements ICommandHandler<AddJourneyStopCommand>
{
  constructor(
    @Inject('IJourneyRepository')
    private readonly journeyRepository: IJourneyRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
  ) {}

  async execute(command: AddJourneyStopCommand): Promise<JourneyStop | null> {
    const journey = await this.journeyRepository.findById(command.journeyId);

    if (!journey) {
      return null;
    }

    const existingStops = await this.stopRepository.findByJourneyId(
      command.journeyId,
    );
    const nextSequence =
      existingStops.reduce((max, stop) => Math.max(max, stop.sequence), 0) +
      1;
    const now = new Date();
    const stop = new JourneyStop(
      randomUUID(),
      command.journeyId,
      command.title,
      command.city,
      command.country,
      command.description,
      nextSequence,
      now,
      now,
    );

    return this.stopRepository.create(stop);
  }
}
