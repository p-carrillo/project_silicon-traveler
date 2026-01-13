import { JourneyEntryDetails } from '../../application/queries/journey-entry-details.type';
import { JourneyEntryResponseDto } from './journey-entry-response.dto';

export class JourneyEntryListResponseDto {
  entries: JourneyEntryResponseDto['entry'][];

  constructor(entries: JourneyEntryDetails[]) {
    this.entries = entries.map(
      ({ entry, stop }) => new JourneyEntryResponseDto(entry, stop).entry,
    );
  }
}
