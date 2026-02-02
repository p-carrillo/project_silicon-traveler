import { describe, it, expect } from 'vitest';
import { Journey } from '../../../src/domain/journey.entity';

describe('Journey entity', () => {
  it('updates position and timestamp', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const journey = new Journey(
      1,
      'Test',
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0 },
      'east',
      now,
      now,
      new Date('2025-01-01T00:00:00Z')
    );

    journey.updatePosition({ lat: 1, lng: 1 });

    expect(journey.currentPosition).toEqual({ lat: 1, lng: 1 });
    expect(journey.updatedAt.getTime()).toBeGreaterThan(now.getTime());
  });
});
