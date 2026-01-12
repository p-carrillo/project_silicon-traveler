import { JourneyStatus } from '../../domain/entities/journey.entity';

export class CreateJourneyRequestDto {
  name: string;
  description?: string;
  status?: JourneyStatus;
  startDate?: string;
  timezone?: string;
}
