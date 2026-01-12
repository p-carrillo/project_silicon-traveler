import { GenerateJourneyEntryRequestDto } from '../../../infrastructure/dto/generate-journey-entry-request.dto';

describe('GenerateJourneyEntryRequestDto', () => {
  it('should hold generation overrides', () => {
    const dto = new GenerateJourneyEntryRequestDto();
    dto.travelDate = '2024-01-01';
    dto.imageModel = 'gpt-image-1';
    dto.textModel = 'gpt-4o-mini';

    expect(dto.travelDate).toBe('2024-01-01');
    expect(dto.imageModel).toBe('gpt-image-1');
    expect(dto.textModel).toBe('gpt-4o-mini');
  });
});
