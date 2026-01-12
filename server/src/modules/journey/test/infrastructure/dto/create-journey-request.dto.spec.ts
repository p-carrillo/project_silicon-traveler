import { CreateJourneyRequestDto } from '../../../infrastructure/dto/create-journey-request.dto';

describe('CreateJourneyRequestDto', () => {
  it('should hold journey request data', () => {
    const dto = new CreateJourneyRequestDto();
    dto.name = 'Journey';
    dto.description = 'A global trip';
    dto.status = 'active';
    dto.startDate = '2024-01-01';
    dto.timezone = 'UTC';

    expect(dto.name).toBe('Journey');
    expect(dto.description).toBe('A global trip');
    expect(dto.status).toBe('active');
    expect(dto.startDate).toBe('2024-01-01');
    expect(dto.timezone).toBe('UTC');
  });
});
