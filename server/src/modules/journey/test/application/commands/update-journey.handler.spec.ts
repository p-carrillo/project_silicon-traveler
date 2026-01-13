import { Test, TestingModule } from '@nestjs/testing';
import { UpdateJourneyHandler } from '../../../application/commands/update-journey.handler';
import { UpdateJourneyCommand } from '../../../application/commands/update-journey.command';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';

describe('UpdateJourneyHandler', () => {
  let handler: UpdateJourneyHandler;
  let repository: jest.Mocked<IJourneyRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateJourneyHandler,
        { provide: 'IJourneyRepository', useValue: repository },
      ],
    }).compile();

    handler = module.get(UpdateJourneyHandler);
  });

  it('should return null when journey is missing', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new UpdateJourneyCommand('journey-id', 'Updated'),
    );

    expect(result).toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should update journey fields', async () => {
    const now = new Date();
    const existing = new Journey(
      'journey-id',
      'Journey',
      null,
      'draft',
      null,
      'UTC',
      now,
      now,
    );
    const updated = new Journey(
      'journey-id',
      'Updated',
      'Description',
      'active',
      '2024-01-01',
      'UTC',
      now,
      new Date(),
    );

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await handler.execute(
      new UpdateJourneyCommand(
        existing.id,
        'Updated',
        'Description',
        'active',
        '2024-01-01',
        'UTC',
      ),
    );

    expect(result).toBe(updated);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated' }),
    );
  });
});
