import { Test, TestingModule } from '@nestjs/testing';
import { ReorderJourneyStopsHandler } from '../../../application/commands/reorder-journey-stops.handler';
import { ReorderJourneyStopsCommand } from '../../../application/commands/reorder-journey-stops.command';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('ReorderJourneyStopsHandler', () => {
  let handler: ReorderJourneyStopsHandler;
  let journeyRepository: jest.Mocked<IJourneyRepository>;
  let stopRepository: jest.Mocked<IJourneyStopRepository>;

  beforeEach(async () => {
    journeyRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    stopRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByJourneyId: jest.fn(),
      findByJourneyIdAndSequence: jest.fn(),
      update: jest.fn(),
      updateSequences: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReorderJourneyStopsHandler,
        {
          provide: 'IJourneyRepository',
          useValue: journeyRepository,
        },
        {
          provide: 'IJourneyStopRepository',
          useValue: stopRepository,
        },
      ],
    }).compile();

    handler = module.get(ReorderJourneyStopsHandler);
  });

  it('should return null when journey is missing', async () => {
    journeyRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new ReorderJourneyStopsCommand('journey-id', ['stop-1']),
    );

    expect(result).toBeNull();
    expect(stopRepository.updateSequences).not.toHaveBeenCalled();
  });

  it('should throw when stop ids are invalid', async () => {
    const now = new Date();
    journeyRepository.findById.mockResolvedValue(
      new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now),
    );
    stopRepository.findByJourneyId.mockResolvedValue([
      new JourneyStop('stop-1', 'journey-id', 'Lisbon', null, null, null, 1, now, now),
    ]);

    await expect(
      handler.execute(new ReorderJourneyStopsCommand('journey-id', ['missing-stop'])),
    ).rejects.toThrow('Stop order includes invalid stop IDs.');
  });

  it('should update sequences and return updated stops', async () => {
    const now = new Date();
    const journey = new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now);
    const stopOne = new JourneyStop('stop-1', journey.id, 'Lisbon', null, null, null, 1, now, now);
    const stopTwo = new JourneyStop('stop-2', journey.id, 'Porto', null, null, null, 2, now, now);

    journeyRepository.findById.mockResolvedValue(journey);
    stopRepository.findByJourneyId
      .mockResolvedValueOnce([stopOne, stopTwo])
      .mockResolvedValueOnce([stopTwo, stopOne]);

    const result = await handler.execute(
      new ReorderJourneyStopsCommand(journey.id, ['stop-2', 'stop-1']),
    );

    expect(stopRepository.updateSequences).toHaveBeenCalledWith(journey.id, [
      'stop-2',
      'stop-1',
    ]);
    expect(result).toEqual([stopTwo, stopOne]);
  });
});
