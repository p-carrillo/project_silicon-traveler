import { UpdateJourneyRequestDto } from '../../../infrastructure/dto/update-journey-request.dto';

describe('UpdateJourneyRequestDto', () => {
  it('should hold update fields', () => {
    const dto = new UpdateJourneyRequestDto();
    dto.name = 'Journey';
    dto.description = 'Updated';
    dto.status = 'active';
    dto.startDate = '2024-01-01';
    dto.timezone = 'UTC';

    expect(dto.name).toBe('Journey');
    expect(dto.description).toBe('Updated');
    expect(dto.status).toBe('active');
    expect(dto.startDate).toBe('2024-01-01');
    expect(dto.timezone).toBe('UTC');
  });
});
