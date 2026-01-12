import { JourneyEntryScheduler } from '../../../infrastructure/schedulers/journey-entry.scheduler';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';
import { CommandBus } from '@nestjs/cqrs';

describe('JourneyEntryScheduler', () => {
  it('should trigger generation for active journeys', async () => {
    const now = new Date();
    const journeyRepository: jest.Mocked<IJourneyRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      updateStatus: jest.fn(),
    };
    const commandBus: jest.Mocked<CommandBus> = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CommandBus>;

    journeyRepository.findActive.mockResolvedValue([
      new Journey('journey-1', 'Journey', null, 'active', null, 'UTC', now, now),
      new Journey('journey-2', 'Journey', null, 'active', null, 'UTC', now, now),
    ]);

    const scheduler = new JourneyEntryScheduler(journeyRepository, commandBus);

    await scheduler.handleDailyGeneration();

    expect(commandBus.execute).toHaveBeenCalledTimes(2);
  });
});
