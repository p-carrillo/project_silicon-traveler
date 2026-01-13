import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JourneyController } from '../../../infrastructure/controllers/journey.controller';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('JourneyController', () => {
  let controller: JourneyController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = { execute: jest.fn() } as unknown as jest.Mocked<CommandBus>;
    queryBus = { execute: jest.fn() } as unknown as jest.Mocked<QueryBus>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JourneyController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get(JourneyController);
  });

  it('should create a journey', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'draft',
      null,
      'UTC',
      now,
      now,
    );
    commandBus.execute.mockResolvedValue(journey);

    const result = await controller.createJourney({
      name: 'Journey',
      timezone: 'UTC',
    });

    expect(result.journey.id).toBe('journey-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should return journey details', async () => {
    const now = new Date();
    const journey = new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now);
    const stops = [
      new JourneyStop('stop-id', journey.id, 'Lisbon', null, null, null, 1, now, now),
    ];
    queryBus.execute.mockResolvedValue({ journey, stops });

    const result = await controller.getJourney('journey-id');

    expect(result.journey.id).toBe('journey-id');
    expect(result.journey.stops).toHaveLength(1);
  });

  it('should list journeys', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      null,
      'UTC',
      now,
      now,
    );
    queryBus.execute.mockResolvedValue([journey]);

    const result = await controller.listJourneys();

    expect(result.journeys).toHaveLength(1);
    expect(result.journeys[0].id).toBe('journey-id');
  });

  it('should throw NotFoundException when journey is missing', async () => {
    queryBus.execute.mockResolvedValue(null);

    await expect(controller.getJourney('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('should add a stop', async () => {
    const now = new Date();
    const stop = new JourneyStop('stop-id', 'journey-id', 'Lisbon', null, null, null, 1, now, now);
    commandBus.execute.mockResolvedValue(stop);

    const result = await controller.addStop('journey-id', { title: 'Lisbon' });

    expect(result.id).toBe('stop-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should throw NotFoundException when adding stop to missing journey', async () => {
    commandBus.execute.mockResolvedValue(null);

    await expect(
      controller.addStop('missing-id', { title: 'Lisbon' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a journey', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      null,
      'UTC',
      now,
      now,
    );
    const stops = [
      new JourneyStop('stop-id', journey.id, 'Lisbon', null, null, null, 1, now, now),
    ];
    commandBus.execute.mockResolvedValue(journey);
    queryBus.execute.mockResolvedValue({ journey, stops });

    const result = await controller.updateJourney('journey-id', {
      name: 'Updated',
    });

    expect(result.journey.id).toBe('journey-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should update a stop', async () => {
    const now = new Date();
    const stop = new JourneyStop(
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
    commandBus.execute.mockResolvedValue(stop);

    const result = await controller.updateStop('journey-id', 'stop-id', {
      title: 'Lisbon',
    });

    expect(result.id).toBe('stop-id');
  });

  it('should throw BadRequestException when reorder fails', async () => {
    commandBus.execute.mockRejectedValue(new Error('Invalid order'));

    await expect(
      controller.reorderStops('journey-id', { orderedStopIds: ['stop-1'] }),
    ).rejects.toThrow(BadRequestException);
  });
});
