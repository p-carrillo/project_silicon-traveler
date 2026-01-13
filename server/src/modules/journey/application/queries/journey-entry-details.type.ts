import { JourneyEntry } from '../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';

export type JourneyEntryDetails = {
  entry: JourneyEntry;
  stop: JourneyStop | null;
};
