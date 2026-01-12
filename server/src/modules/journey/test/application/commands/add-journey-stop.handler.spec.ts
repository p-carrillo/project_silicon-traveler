import { Test, TestingModule } from '@nestjs/testing';
import { AddJourneyStopHandler } from '../../../application/commands/add-journey-stop.handler';
import { AddJourneyStopCommand } from '../../../application/commands/add-journey-stop.command';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('AddJourneyStopHandler', () => {
  let handler: AddJourneyStopHandler;
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
        AddJourneyStopHandler,
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

    handler = module.get(AddJourneyStopHandler);
  });

  it('should return null when journey is missing', async () => {
    journeyRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new AddJourneyStopCommand('journey-id', 'Lisbon', null, null, null),
    );

    expect(result).toBeNull();
    expect(stopRepository.create).not.toHaveBeenCalled();
  });

  it('should create a stop with the next sequence', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'World Journey',
      null,
      'active',
      null,
      'UTC',
      now,
      now,
    );
    const existingStop = new JourneyStop(
      'stop-1',
      journey.id,
      'Lisbon',
      null,
      null,
      null,
      1,
      now,
      now,
    );
    const newStop = new JourneyStop(
      'stop-2',
      journey.id,
      'Porto',
      null,
      null,
      null,
      2,
      now,
      now,
    );

    journeyRepository.findById.mockResolvedValue(journey);
    stopRepository.findByJourneyId.mockResolvedValue([existingStop]);
    stopRepository.create.mockResolvedValue(newStop);

    const result = await handler.execute(
      new AddJourneyStopCommand(
        journey.id,
        'Porto',
        null,
        null,
        null,
      ),
    );

    expect(result).toBe(newStop);
    expect(stopRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: journey.id,
        title: 'Porto',
        sequence: 2,
      }),
    );
  });
});
