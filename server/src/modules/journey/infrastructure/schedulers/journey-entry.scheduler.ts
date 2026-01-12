import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { GenerateDailyJourneyEntryCommand } from '../../application/commands/generate-daily-journey-entry.command';

@Injectable()
export class JourneyEntryScheduler {
  private readonly logger = new Logger(JourneyEntryScheduler.name);

  constructor(
    @Inject('IJourneyRepository')
    private readonly journeyRepository: IJourneyRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'UTC' })
  async handleDailyGeneration(): Promise<void> {
    const journeys = await this.journeyRepository.findActive();

    for (const journey of journeys) {
      try {
        await this.commandBus.execute(
          new GenerateDailyJourneyEntryCommand(journey.id),
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate entry for journey ${journey.id}.`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }
}
