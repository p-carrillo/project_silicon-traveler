import { JourneyEntryResponseDto } from '../../../infrastructure/dto/journey-entry-response.dto';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';

describe('JourneyEntryResponseDto', () => {
  it('should map journey entry to response data', () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry.png',
      'journeys/journey-id/entry.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );

    const dto = new JourneyEntryResponseDto(entry);

    expect(dto.entry.id).toBe('entry-id');
    expect(dto.entry.travelDate).toBe('2024-01-01');
    expect(dto.entry.imageUrl).toBe('https://images.local/entry.png');
  });
});
