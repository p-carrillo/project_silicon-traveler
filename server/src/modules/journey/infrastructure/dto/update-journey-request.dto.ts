import { JourneyStatus } from '../../domain/entities/journey.entity';

export class UpdateJourneyRequestDto {
  name?: string;
  description?: string | null;
  status?: JourneyStatus;
  startDate?: string | null;
  timezone?: string;
}
