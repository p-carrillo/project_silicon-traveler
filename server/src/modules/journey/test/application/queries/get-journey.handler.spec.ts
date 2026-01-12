import { Test, TestingModule } from '@nestjs/testing';
import { GetJourneyHandler } from '../../../application/queries/get-journey.handler';
import { GetJourneyQuery } from '../../../application/queries/get-journey.query';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('GetJourneyHandler', () => {
  let handler: GetJourneyHandler;
  let journeyRepository: jest.Mocked<IJourneyRepository>;
  let stopRepository: jest.Mocked<IJourneyStopRepository>;

  beforeEach(async () => {
    journeyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      updateStatus: jest.fn(),
    };
    stopRepository = {
      create: jest.fn(),
      findByJourneyId: jest.fn(),
      findByJourneyIdAndSequence: jest.fn(),
      updateSequences: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetJourneyHandler,
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

    handler = module.get(GetJourneyHandler);
  });

  it('should return null when journey is missing', async () => {
    journeyRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(new GetJourneyQuery('journey-id'));

    expect(result).toBeNull();
  });

  it('should return journey details with ordered stops', async () => {
    const now = new Date();
    const journey = new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now);
    const stopOne = new JourneyStop('stop-1', journey.id, 'Lisbon', null, null, null, 2, now, now);
    const stopTwo = new JourneyStop('stop-2', journey.id, 'Porto', null, null, null, 1, now, now);

    journeyRepository.findById.mockResolvedValue(journey);
    stopRepository.findByJourneyId.mockResolvedValue([stopOne, stopTwo]);

    const result = await handler.execute(new GetJourneyQuery(journey.id));

    expect(result).not.toBeNull();
    expect(result?.journey).toBe(journey);
    expect(result?.stops).toEqual([stopTwo, stopOne]);
  });
});
