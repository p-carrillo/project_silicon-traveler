import { JourneyEntry } from '../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';

type JourneyEntryLocation = {
  title: string;
  city: string | null;
  country: string | null;
};

export class JourneyEntryResponseDto {
  entry: {
    id: string;
    travel_date: string;
    image_url_full: string;
    image_url_web: string;
    image_url_thumb: string;
    text_body: string;
    location: JourneyEntryLocation | null;
  };

  constructor(entry: JourneyEntry, stop?: JourneyStop | null) {
    this.entry = {
      id: entry.id,
      travel_date: entry.travelDate,
      image_url_full: entry.imageUrlFull,
      image_url_web: entry.imageUrlWeb,
      image_url_thumb: entry.imageUrlThumb,
      text_body: entry.textBody,
      location: stop
        ? {
            title: stop.title,
            city: stop.city,
            country: stop.country,
          }
        : null,
    };
  }
}
