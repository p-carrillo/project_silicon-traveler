import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateJourneyCommand } from './update-journey.command';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { Journey } from '../../domain/entities/journey.entity';

@CommandHandler(UpdateJourneyCommand)
export class UpdateJourneyHandler
  implements ICommandHandler<UpdateJourneyCommand>
{
  constructor(
    @Inject('IJourneyRepository')
    private readonly repository: IJourneyRepository,
  ) {}

  async execute(command: UpdateJourneyCommand): Promise<Journey | null> {
    const existing = await this.repository.findById(command.id);

    if (!existing) {
      return null;
    }

    const description =
      command.description === undefined
        ? existing.description
        : command.description;
    const startDate =
      command.startDate === undefined
        ? existing.startDate
        : command.startDate;

    const updated = new Journey(
      existing.id,
      command.name ?? existing.name,
      description,
      command.status ?? existing.status,
      startDate,
      command.timezone ?? existing.timezone,
      existing.createdAt,
      new Date(),
    );

    return this.repository.update(updated);
  }
}
