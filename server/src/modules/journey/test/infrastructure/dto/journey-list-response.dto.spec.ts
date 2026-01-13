import { JourneyListResponseDto } from '../../../infrastructure/dto/journey-list-response.dto';
import { Journey } from '../../../domain/entities/journey.entity';

describe('JourneyListResponseDto', () => {
  it('should map journeys to response shape', () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      '2024-01-01',
      'UTC',
      now,
      now,
    );

    const dto = new JourneyListResponseDto([journey]);

    expect(dto.journeys).toHaveLength(1);
    expect(dto.journeys[0].id).toBe('journey-id');
    expect(dto.journeys[0].start_date).toBe('2024-01-01');
  });
});
