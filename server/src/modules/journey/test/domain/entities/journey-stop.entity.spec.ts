import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('JourneyStop', () => {
  it('should expose journey stop properties', () => {
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

    expect(stop.id).toBe('stop-id');
    expect(stop.journeyId).toBe('journey-id');
    expect(stop.title).toBe('Lisbon');
    expect(stop.city).toBe('Lisbon');
    expect(stop.country).toBe('Portugal');
    expect(stop.description).toBe('Old town streets');
    expect(stop.sequence).toBe(1);
    expect(stop.createdAt).toBe(now);
    expect(stop.updatedAt).toBe(now);
  });
});
