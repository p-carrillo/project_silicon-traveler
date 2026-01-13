import { Journey, JourneyStatus } from '../../domain/entities/journey.entity';

export class JourneyListResponseDto {
  journeys: Array<{
    id: string;
    name: string;
    description: string | null;
    status: JourneyStatus;
    start_date: string | null;
    timezone: string;
  }>;

  constructor(journeys: Journey[]) {
    this.journeys = journeys.map((journey) => ({
      id: journey.id,
      name: journey.name,
      description: journey.description,
      status: journey.status,
      start_date: journey.startDate,
      timezone: journey.timezone,
    }));
  }
}
