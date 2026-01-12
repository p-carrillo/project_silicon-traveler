import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateJourneyCommand } from './create-journey.command';
import { Journey } from '../../domain/entities/journey.entity';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';

@CommandHandler(CreateJourneyCommand)
export class CreateJourneyHandler
  implements ICommandHandler<CreateJourneyCommand>
{
  constructor(
    @Inject('IJourneyRepository')
    private readonly repository: IJourneyRepository,
  ) {}

  async execute(command: CreateJourneyCommand): Promise<Journey> {
    const now = new Date();
    const journey = new Journey(
      randomUUID(),
      command.name,
      command.description,
      command.status,
      command.startDate,
      command.timezone,
      now,
      now,
    );

    return this.repository.create(journey);
  }
}
