import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyRepository } from '../../../../infrastructure/persistence/repositories/journey.repository';
import { JourneyEntity } from '../../../../infrastructure/persistence/entities/journey.typeorm-entity';
import { Journey } from '../../../../domain/entities/journey.entity';

describe('JourneyRepository', () => {
  let repository: JourneyRepository;
  let typeormRepository: jest.Mocked<Repository<JourneyEntity>>;

  beforeEach(async () => {
    const mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyRepository,
        {
          provide: getRepositoryToken(JourneyEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get(JourneyRepository);
    typeormRepository = module.get(getRepositoryToken(JourneyEntity));
  });

  it('should return a journey when found by id', async () => {
    const entity = new JourneyEntity();
    entity.id = 'journey-id';
    entity.name = 'Journey';
    entity.description = null;
    entity.status = 'active';
    entity.startDate = null;
    entity.timezone = 'UTC';
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.findOne.mockResolvedValue(entity);

    const result = await repository.findById('journey-id');

    expect(result).toBeInstanceOf(Journey);
    expect(result?.id).toBe('journey-id');
    expect(typeormRepository.findOne).toHaveBeenCalledWith({ where: { id: 'journey-id' } });
  });

  it('should return active journeys', async () => {
    const entity = new JourneyEntity();
    entity.id = 'journey-id';
    entity.name = 'Journey';
    entity.description = null;
    entity.status = 'active';
    entity.startDate = null;
    entity.timezone = 'UTC';
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.find.mockResolvedValue([entity]);

    const result = await repository.findActive();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('journey-id');
    expect(typeormRepository.find).toHaveBeenCalledWith({
      where: { status: 'active' },
      order: { createdAt: 'ASC' },
    });
  });

  it('should return all journeys', async () => {
    const entity = new JourneyEntity();
    entity.id = 'journey-id';
    entity.name = 'Journey';
    entity.description = null;
    entity.status = 'draft';
    entity.startDate = null;
    entity.timezone = 'UTC';
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.find.mockResolvedValue([entity]);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('journey-id');
    expect(typeormRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
  });

  it('should update a journey', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      '2024-01-01',
      'UTC',
      now,
      now,
    );
    const entity = new JourneyEntity();
    entity.id = journey.id;
    entity.name = journey.name;
    entity.description = journey.description;
    entity.status = journey.status;
    entity.startDate = journey.startDate;
    entity.timezone = journey.timezone;
    entity.createdAt = journey.createdAt;
    entity.updatedAt = journey.updatedAt;

    typeormRepository.save.mockResolvedValue(entity);

    const result = await repository.update(journey);

    expect(result).toBeInstanceOf(Journey);
    expect(result.id).toBe('journey-id');
    expect(typeormRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'journey-id' }),
    );
  });
});
