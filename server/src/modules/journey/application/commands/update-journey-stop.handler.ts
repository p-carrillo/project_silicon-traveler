import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateJourneyStopCommand } from './update-journey-stop.command';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';

@CommandHandler(UpdateJourneyStopCommand)
export class UpdateJourneyStopHandler
  implements ICommandHandler<UpdateJourneyStopCommand>
{
  constructor(
    @Inject('IJourneyStopRepository')
    private readonly repository: IJourneyStopRepository,
  ) {}

  async execute(command: UpdateJourneyStopCommand): Promise<JourneyStop | null> {
    const existing = await this.repository.findById(command.stopId);

    if (!existing || existing.journeyId !== command.journeyId) {
      return null;
    }

    const city = command.city === undefined ? existing.city : command.city;
    const country =
      command.country === undefined ? existing.country : command.country;
    const description =
      command.description === undefined
        ? existing.description
        : command.description;

    const updated = new JourneyStop(
      existing.id,
      existing.journeyId,
      command.title ?? existing.title,
      city,
      country,
      description,
      existing.sequence,
      existing.createdAt,
      new Date(),
    );

    return this.repository.update(updated);
  }
}
