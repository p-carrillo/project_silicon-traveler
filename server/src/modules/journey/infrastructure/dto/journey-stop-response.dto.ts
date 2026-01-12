import { JourneyStop } from '../../domain/entities/journey-stop.entity';

export class JourneyStopResponseDto {
  id: string;
  title: string;
  city: string | null;
  country: string | null;
  description: string | null;
  sequence: number;

  constructor(stop: JourneyStop) {
    this.id = stop.id;
    this.title = stop.title;
    this.city = stop.city;
    this.country = stop.country;
    this.description = stop.description;
    this.sequence = stop.sequence;
  }
}
