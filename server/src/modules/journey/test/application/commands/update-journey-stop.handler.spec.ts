import { Test, TestingModule } from '@nestjs/testing';
import { UpdateJourneyStopHandler } from '../../../application/commands/update-journey-stop.handler';
import { UpdateJourneyStopCommand } from '../../../application/commands/update-journey-stop.command';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('UpdateJourneyStopHandler', () => {
  let handler: UpdateJourneyStopHandler;
  let repository: jest.Mocked<IJourneyStopRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByJourneyId: jest.fn(),
      findByJourneyIdAndSequence: jest.fn(),
      update: jest.fn(),
      updateSequences: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateJourneyStopHandler,
        { provide: 'IJourneyStopRepository', useValue: repository },
      ],
    }).compile();

    handler = module.get(UpdateJourneyStopHandler);
  });

  it('should return null when stop is missing', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new UpdateJourneyStopCommand('journey-id', 'stop-id', 'Lisbon'),
    );

    expect(result).toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should return null when stop belongs to another journey', async () => {
    const now = new Date();
    repository.findById.mockResolvedValue(
      new JourneyStop(
        'stop-id',
        'other-journey',
        'Lisbon',
        null,
        null,
        null,
        1,
        now,
        now,
      ),
    );

    const result = await handler.execute(
      new UpdateJourneyStopCommand('journey-id', 'stop-id', 'Lisbon'),
    );

    expect(result).toBeNull();
  });

  it('should update stop details', async () => {
    const now = new Date();
    const existing = new JourneyStop(
      'stop-id',
      'journey-id',
      'Lisbon',
      null,
      null,
      null,
      1,
      now,
      now,
    );
    const updated = new JourneyStop(
      existing.id,
      existing.journeyId,
      'Porto',
      'Porto',
      'Portugal',
      'Updated',
      existing.sequence,
      existing.createdAt,
      new Date(),
    );

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await handler.execute(
      new UpdateJourneyStopCommand(
        existing.journeyId,
        existing.id,
        'Porto',
        'Porto',
        'Portugal',
        'Updated',
      ),
    );

    expect(result).toBe(updated);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Porto' }),
    );
  });
});
