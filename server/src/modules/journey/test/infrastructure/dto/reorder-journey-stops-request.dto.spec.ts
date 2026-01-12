import { ReorderJourneyStopsRequestDto } from '../../../infrastructure/dto/reorder-journey-stops-request.dto';

describe('ReorderJourneyStopsRequestDto', () => {
  it('should hold stop order ids', () => {
    const dto = new ReorderJourneyStopsRequestDto();
    dto.orderedStopIds = ['stop-1', 'stop-2'];

    expect(dto.orderedStopIds).toEqual(['stop-1', 'stop-2']);
  });
});
