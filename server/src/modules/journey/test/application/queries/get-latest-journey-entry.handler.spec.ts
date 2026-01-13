import { Test, TestingModule } from '@nestjs/testing';
import { GetLatestJourneyEntryHandler } from '../../../application/queries/get-latest-journey-entry.handler';
import { GetLatestJourneyEntryQuery } from '../../../application/queries/get-latest-journey-entry.query';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('GetLatestJourneyEntryHandler', () => {
  let handler: GetLatestJourneyEntryHandler;
  let repository: jest.Mocked<IJourneyEntryRepository>;
  let stopRepository: jest.Mocked<IJourneyStopRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByJourneyIdAndDate: jest.fn(),
      findByJourneyId: jest.fn(),
      findLatestByJourneyId: jest.fn(),
      countByJourneyId: jest.fn(),
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
        GetLatestJourneyEntryHandler,
        {
          provide: 'IJourneyEntryRepository',
          useValue: repository,
        },
        {
          provide: 'IJourneyStopRepository',
          useValue: stopRepository,
        },
      ],
    }).compile();

    handler = module.get(GetLatestJourneyEntryHandler);
  });

  it('should return latest entry', async () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry-full.png',
      'https://images.local/entry-web.png',
      'https://images.local/entry-thumb.png',
      'journeys/journey-id/entry-full.png',
      'journeys/journey-id/entry-web.png',
      'journeys/journey-id/entry-thumb.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    const stop = new JourneyStop(
      'stop-id',
      'journey-id',
      'Lisbon',
      'Lisbon',
      'Portugal',
      null,
      1,
      now,
      now,
    );
    repository.findLatestByJourneyId.mockResolvedValue(entry);
    stopRepository.findByJourneyId.mockResolvedValue([stop]);

    const result = await handler.execute(new GetLatestJourneyEntryQuery('journey-id'));

    expect(result?.entry).toBe(entry);
    expect(result?.stop?.id).toBe('stop-id');
    expect(repository.findLatestByJourneyId).toHaveBeenCalledWith('journey-id');
  });
});
