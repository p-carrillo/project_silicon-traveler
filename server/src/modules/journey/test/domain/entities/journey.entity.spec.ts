import { Journey } from '../../../domain/entities/journey.entity';

describe('Journey', () => {
  it('should expose journey properties', () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'World Photo Journey',
      'A global tour',
      'active',
      '2024-01-01',
      'UTC',
      now,
      now,
    );

    expect(journey.id).toBe('journey-id');
    expect(journey.name).toBe('World Photo Journey');
    expect(journey.description).toBe('A global tour');
    expect(journey.status).toBe('active');
    expect(journey.startDate).toBe('2024-01-01');
    expect(journey.timezone).toBe('UTC');
    expect(journey.createdAt).toBe(now);
    expect(journey.updatedAt).toBe(now);
  });
});
