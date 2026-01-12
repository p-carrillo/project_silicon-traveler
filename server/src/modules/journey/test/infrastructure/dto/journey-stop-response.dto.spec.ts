import { JourneyStopResponseDto } from '../../../infrastructure/dto/journey-stop-response.dto';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('JourneyStopResponseDto', () => {
  it('should map journey stop to response data', () => {
    const now = new Date();
    const stop = new JourneyStop(
      'stop-id',
      'journey-id',
      'Lisbon',
      'Lisbon',
      'Portugal',
      'Old town streets',
      1,
      now,
      now,
    );

    const dto = new JourneyStopResponseDto(stop);

    expect(dto.id).toBe('stop-id');
    expect(dto.title).toBe('Lisbon');
    expect(dto.city).toBe('Lisbon');
    expect(dto.country).toBe('Portugal');
    expect(dto.description).toBe('Old town streets');
    expect(dto.sequence).toBe(1);
  });
});
