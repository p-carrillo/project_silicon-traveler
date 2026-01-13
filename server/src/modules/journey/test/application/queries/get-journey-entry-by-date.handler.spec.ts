import { Test, TestingModule } from '@nestjs/testing';
import { GetJourneyEntryByDateHandler } from '../../../application/queries/get-journey-entry-by-date.handler';
import { GetJourneyEntryByDateQuery } from '../../../application/queries/get-journey-entry-by-date.query';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';

describe('GetJourneyEntryByDateHandler', () => {
  let handler: GetJourneyEntryByDateHandler;
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
        GetJourneyEntryByDateHandler,
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

    handler = module.get(GetJourneyEntryByDateHandler);
  });

  it('should return entry with stop data', async () => {
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
    entryRepository.findByJourneyIdAndDate.mockResolvedValue(entry);
    stopRepository.findByJourneyId.mockResolvedValue([stop]);

    const result = await handler.execute(
      new GetJourneyEntryByDateQuery('journey-id', '2024-01-01'),
    );

    expect(result?.entry.id).toBe('entry-id');
    expect(result?.stop?.id).toBe('stop-id');
  });
});
