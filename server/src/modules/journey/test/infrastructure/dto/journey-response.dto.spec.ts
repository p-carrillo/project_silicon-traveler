import { JourneyResponseDto } from '../../../infrastructure/dto/journey-response.dto';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('JourneyResponseDto', () => {
  it('should map journey and stops to response', () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      null,
      'UTC',
      now,
      now,
    );
    const stop = new JourneyStop(
      'stop-id',
      'journey-id',
      'Lisbon',
      null,
      null,
      null,
      1,
      now,
      now,
    );

    const dto = new JourneyResponseDto(journey, [stop]);

    expect(dto.journey.id).toBe('journey-id');
    expect(dto.journey.name).toBe('Journey');
    expect(dto.journey.status).toBe('active');
    expect(dto.journey.stops).toHaveLength(1);
  });
});
