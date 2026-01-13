import { Test, TestingModule } from '@nestjs/testing';
import { ListJourneyEntriesHandler } from '../../../application/queries/list-journey-entries.handler';
import { ListJourneyEntriesQuery } from '../../../application/queries/list-journey-entries.query';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('ListJourneyEntriesHandler', () => {
  let handler: ListJourneyEntriesHandler;
  let entryRepository: jest.Mocked<IJourneyEntryRepository>;
  let stopRepository: jest.Mocked<IJourneyStopRepository>;

  beforeEach(async () => {
    entryRepository = {
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
        ListJourneyEntriesHandler,
        {
          provide: 'IJourneyEntryRepository',
          useValue: entryRepository,
        },
        {
          provide: 'IJourneyStopRepository',
          useValue: stopRepository,
        },
      ],
    }).compile();

    handler = module.get(ListJourneyEntriesHandler);
  });

  it('should return entries with stop data', async () => {
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
    entryRepository.findByJourneyId.mockResolvedValue([entry]);
    stopRepository.findByJourneyId.mockResolvedValue([stop]);

    const result = await handler.execute(
      new ListJourneyEntriesQuery('journey-id', '2024-01', 10, 0),
    );

    expect(result).toHaveLength(1);
    expect(result[0].entry.id).toBe('entry-id');
    expect(result[0].stop?.id).toBe('stop-id');
    expect(entryRepository.findByJourneyId).toHaveBeenCalledWith('journey-id', {
      month: '2024-01',
      limit: 10,
      offset: 0,
    });
  });
});
