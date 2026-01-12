import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { JourneyEntryController } from '../../../infrastructure/controllers/journey-entry.controller';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';

describe('JourneyEntryController', () => {
  let controller: JourneyEntryController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = { execute: jest.fn() } as unknown as jest.Mocked<CommandBus>;
    queryBus = { execute: jest.fn() } as unknown as jest.Mocked<QueryBus>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyEntryController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get(JourneyEntryController);
  });

  it('should return latest entry', async () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry.png',
      'journeys/journey-id/entry.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    queryBus.execute.mockResolvedValue(entry);

    const result = await controller.getLatestEntry('journey-id');

    expect(result.entry.id).toBe('entry-id');
    expect(queryBus.execute).toHaveBeenCalled();
  });

  it('should throw NotFoundException when latest entry is missing', async () => {
    queryBus.execute.mockResolvedValue(null);

    await expect(controller.getLatestEntry('journey-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should generate entry', async () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry.png',
      'journeys/journey-id/entry.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    commandBus.execute.mockResolvedValue(entry);

    const result = await controller.generateEntry('journey-id', {
      travelDate: '2024-01-01',
    });

    expect(result.entry.id).toBe('entry-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should throw NotFoundException when generation returns null', async () => {
    commandBus.execute.mockResolvedValue(null);

    await expect(
      controller.generateEntry('journey-id', {}),
    ).rejects.toThrow(NotFoundException);
  });
});
