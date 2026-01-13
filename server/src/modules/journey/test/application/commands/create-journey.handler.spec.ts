import { Test, TestingModule } from '@nestjs/testing';
import { CreateJourneyHandler } from '../../../application/commands/create-journey.handler';
import { CreateJourneyCommand } from '../../../application/commands/create-journey.command';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';

describe('CreateJourneyHandler', () => {
  let handler: CreateJourneyHandler;
  let repository: jest.Mocked<IJourneyRepository>;

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IJourneyRepository> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateJourneyHandler,
        {
          provide: 'IJourneyRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateJourneyHandler>(CreateJourneyHandler);
    repository = module.get('IJourneyRepository');
  });

  it('should create and return a journey', async () => {
    const command = new CreateJourneyCommand(
      'World Journey',
      'A global trip',
      'active',
      '2024-01-01',
      'UTC',
    );
    const savedJourney = new Journey(
      'journey-id',
      command.name,
      command.description,
      command.status,
      command.startDate,
      command.timezone,
      new Date(),
      new Date(),
    );
    repository.create.mockResolvedValue(savedJourney);

    const result = await handler.execute(command);

    expect(result).toBe(savedJourney);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: command.name,
        description: command.description,
        status: command.status,
        startDate: command.startDate,
        timezone: command.timezone,
      }),
    );
  });
});
