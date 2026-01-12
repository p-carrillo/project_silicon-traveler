import { CreateJourneyStopRequestDto } from '../../../infrastructure/dto/create-journey-stop-request.dto';

describe('CreateJourneyStopRequestDto', () => {
  it('should hold journey stop request data', () => {
    const dto = new CreateJourneyStopRequestDto();
    dto.title = 'Lisbon';
    dto.city = 'Lisbon';
    dto.country = 'Portugal';
    dto.description = 'Old town streets';

    expect(dto.title).toBe('Lisbon');
    expect(dto.city).toBe('Lisbon');
    expect(dto.country).toBe('Portugal');
    expect(dto.description).toBe('Old town streets');
  });
});
