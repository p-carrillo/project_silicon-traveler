import { describe, it, expect, vi } from 'vitest';
import { CreateJourneyUseCase } from '../../../src/application/create-journey.use-case';
import { Journey } from '../../../src/domain/journey.entity';

describe('CreateJourneyUseCase', () => {
  it('delegates creation to the repository', async () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const origin = { lat: 10, lng: 20 };
    const created = new Journey(1, 'Trip', origin, origin, 'east', now, now, now);

    const repo = {
      create: vi.fn().mockResolvedValue(created),
    };

    const useCase = new CreateJourneyUseCase(repo as any);
    const result = await useCase.execute('Trip', origin, 'east');

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Trip',
        originPoint: origin,
        currentPosition: origin,
        heading: 'east',
      })
    );
    expect(result).toBe(created);
  });
});
