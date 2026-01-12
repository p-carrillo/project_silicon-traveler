import { Test, TestingModule } from '@nestjs/testing';
import { GetLatestJourneyEntryHandler } from '../../../application/queries/get-latest-journey-entry.handler';
import { GetLatestJourneyEntryQuery } from '../../../application/queries/get-latest-journey-entry.query';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';

describe('GetLatestJourneyEntryHandler', () => {
  let handler: GetLatestJourneyEntryHandler;
  let repository: jest.Mocked<IJourneyEntryRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByJourneyIdAndDate: jest.fn(),
      findLatestByJourneyId: jest.fn(),
      countByJourneyId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLatestJourneyEntryHandler,
        {
          provide: 'IJourneyEntryRepository',
          useValue: repository,
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
      'https://images.local/entry.png',
      'journeys/journey-id/entry.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    repository.findLatestByJourneyId.mockResolvedValue(entry);

    const result = await handler.execute(new GetLatestJourneyEntryQuery('journey-id'));

    expect(result).toBe(entry);
    expect(repository.findLatestByJourneyId).toHaveBeenCalledWith('journey-id');
  });
});
