import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyStopRepository } from '../../../../infrastructure/persistence/repositories/journey-stop.repository';
import { JourneyStopEntity } from '../../../../infrastructure/persistence/entities/journey-stop.typeorm-entity';
import { JourneyStop } from '../../../../domain/entities/journey-stop.entity';

describe('JourneyStopRepository', () => {
  let repository: JourneyStopRepository;
  let typeormRepository: jest.Mocked<Repository<JourneyStopEntity>> & {
    manager: { transaction: jest.Mock };
  };

  beforeEach(async () => {
    const mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      manager: {
        transaction: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyStopRepository,
        {
          provide: getRepositoryToken(JourneyStopEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get(JourneyStopRepository);
    typeormRepository = module.get(getRepositoryToken(JourneyStopEntity));
  });

  it('should return journey stops for a journey', async () => {
    const entity = new JourneyStopEntity();
    entity.id = 'stop-id';
    entity.journeyId = 'journey-id';
    entity.title = 'Lisbon';
    entity.city = null;
    entity.country = null;
    entity.description = null;
    entity.sequence = 1;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.find.mockResolvedValue([entity]);

    const result = await repository.findByJourneyId('journey-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(JourneyStop);
    expect(typeormRepository.find).toHaveBeenCalledWith({
      where: { journeyId: 'journey-id' },
      order: { sequence: 'ASC' },
    });
  });

  it('should update sequences in a transaction', async () => {
    const update = jest.fn();
    typeormRepository.manager.transaction.mockImplementation(async (callback) => {
      await callback({ update });
    });

    await repository.updateSequences('journey-id', ['stop-1', 'stop-2']);

    expect(typeormRepository.manager.transaction).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      JourneyStopEntity,
      { id: 'stop-1', journeyId: 'journey-id' },
      expect.objectContaining({ sequence: 1 }),
    );
    expect(update).toHaveBeenCalledWith(
      JourneyStopEntity,
      { id: 'stop-2', journeyId: 'journey-id' },
      expect.objectContaining({ sequence: 2 }),
    );
  });
});
