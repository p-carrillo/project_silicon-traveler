import { Journey, JourneyStatus } from '../../domain/entities/journey.entity';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';
import { JourneyStopResponseDto } from './journey-stop-response.dto';

export class JourneyResponseDto {
  journey: {
    id: string;
    name: string;
    description: string | null;
    status: JourneyStatus;
    start_date: string | null;
    timezone: string;
    stops: JourneyStopResponseDto[];
  };

  constructor(journey: Journey, stops: JourneyStop[]) {
    this.journey = {
      id: journey.id,
      name: journey.name,
      description: journey.description,
      status: journey.status,
      start_date: journey.startDate,
      timezone: journey.timezone,
      stops: stops.map((stop) => new JourneyStopResponseDto(stop)),
    };
  }
}
