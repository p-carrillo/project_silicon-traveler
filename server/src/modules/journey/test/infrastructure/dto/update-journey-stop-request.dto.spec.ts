import { UpdateJourneyStopRequestDto } from '../../../infrastructure/dto/update-journey-stop-request.dto';

describe('UpdateJourneyStopRequestDto', () => {
  it('should hold stop update fields', () => {
    const dto = new UpdateJourneyStopRequestDto();
    dto.title = 'Lisbon';
    dto.city = 'Lisbon';
    dto.country = 'Portugal';
    dto.description = 'Updated';

    expect(dto.title).toBe('Lisbon');
    expect(dto.city).toBe('Lisbon');
    expect(dto.country).toBe('Portugal');
    expect(dto.description).toBe('Updated');
  });
});
