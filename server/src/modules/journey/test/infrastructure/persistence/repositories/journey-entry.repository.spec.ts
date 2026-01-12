import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyEntryRepository } from '../../../../infrastructure/persistence/repositories/journey-entry.repository';
import { JourneyEntryEntity } from '../../../../infrastructure/persistence/entities/journey-entry.typeorm-entity';
import { JourneyEntry } from '../../../../domain/entities/journey-entry.entity';

describe('JourneyEntryRepository', () => {
  let repository: JourneyEntryRepository;
  let typeormRepository: jest.Mocked<Repository<JourneyEntryEntity>>;

  beforeEach(async () => {
    const mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyEntryRepository,
        {
          provide: getRepositoryToken(JourneyEntryEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get(JourneyEntryRepository);
    typeormRepository = module.get(getRepositoryToken(JourneyEntryEntity));
  });

  it('should return latest journey entry', async () => {
    const entity = new JourneyEntryEntity();
    entity.id = 'entry-id';
    entity.journeyId = 'journey-id';
    entity.journeyStopId = 'stop-id';
    entity.travelDate = '2024-01-01';
    entity.stageIndex = 1;
    entity.imageUrl = 'https://images.local/entry.png';
    entity.imageStorageKey = 'journeys/journey-id/entry.png';
    entity.textBody = 'Text body';
    entity.imagePromptId = 'image-template-id';
    entity.textPromptId = 'text-template-id';
    entity.imageModel = 'gpt-image-1';
    entity.textModel = 'gpt-4o-mini';
    entity.createdAt = new Date();

    typeormRepository.findOne.mockResolvedValue(entity);

    const result = await repository.findLatestByJourneyId('journey-id');

    expect(result).toBeInstanceOf(JourneyEntry);
    expect(result?.id).toBe('entry-id');
    expect(typeormRepository.findOne).toHaveBeenCalledWith({
      where: { journeyId: 'journey-id' },
      order: { travelDate: 'DESC', createdAt: 'DESC' },
    });
  });

  it('should return null when no entry found by date', async () => {
    typeormRepository.findOne.mockResolvedValue(null);

    const result = await repository.findByJourneyIdAndDate('journey-id', '2024-01-01');

    expect(result).toBeNull();
    expect(typeormRepository.findOne).toHaveBeenCalledWith({
      where: { journeyId: 'journey-id', travelDate: '2024-01-01' },
    });
  });
});
