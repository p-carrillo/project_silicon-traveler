import { JourneyEntryResponseDto } from '../../../infrastructure/dto/journey-entry-response.dto';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('JourneyEntryResponseDto', () => {
  it('should map journey entry to response data', () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry-full.png',
      'https://images.local/entry-web.png',
      'https://images.local/entry-thumb.png',
      'journeys/journey-id/entry-full.png',
      'journeys/journey-id/entry-web.png',
      'journeys/journey-id/entry-thumb.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    const stop = new JourneyStop(
      'stop-id',
      'journey-id',
      'Lisbon',
      'Lisbon',
      'Portugal',
      null,
      1,
      now,
      now,
    );

    const dto = new JourneyEntryResponseDto(entry, stop);

    expect(dto.entry.id).toBe('entry-id');
    expect(dto.entry.travel_date).toBe('2024-01-01');
    expect(dto.entry.image_url_web).toBe('https://images.local/entry-web.png');
    expect(dto.entry.location?.title).toBe('Lisbon');
  });
});
