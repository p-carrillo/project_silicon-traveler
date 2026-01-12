import { JourneyStatus } from '../../domain/entities/journey.entity';

export class CreateJourneyCommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: JourneyStatus,
    public readonly startDate: string | null,
    public readonly timezone: string,
  ) {}
}
