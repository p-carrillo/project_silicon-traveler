import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptTemplateRepository } from '../../../../infrastructure/persistence/repositories/prompt-template.repository';
import { PromptTemplateEntity } from '../../../../infrastructure/persistence/entities/prompt-template.typeorm-entity';
import { PromptTemplate } from '../../../../domain/entities/prompt-template.entity';

describe('PromptTemplateRepository', () => {
  let repository: PromptTemplateRepository;
  let typeormRepository: jest.Mocked<Repository<PromptTemplateEntity>>;

  beforeEach(async () => {
    const mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptTemplateRepository,
        {
          provide: getRepositoryToken(PromptTemplateEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get(PromptTemplateRepository);
    typeormRepository = module.get(getRepositoryToken(PromptTemplateEntity));
  });

  it('should return active prompt template by kind', async () => {
    const entity = new PromptTemplateEntity();
    entity.id = 'template-id';
    entity.keyName = 'image_default';
    entity.kind = 'image';
    entity.template = 'Photo of {{location}}';
    entity.isActive = true;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.findOne.mockResolvedValue(entity);

    const result = await repository.findActiveByKind('image');

    expect(result).toBeInstanceOf(PromptTemplate);
    expect(result?.id).toBe('template-id');
    expect(typeormRepository.findOne).toHaveBeenCalledWith({
      where: { kind: 'image', isActive: true },
      order: { updatedAt: 'DESC' },
    });
  });

  it('should return all templates', async () => {
    const entity = new PromptTemplateEntity();
    entity.id = 'template-id';
    entity.keyName = 'image_default';
    entity.kind = 'image';
    entity.template = 'Photo of {{location}}';
    entity.isActive = true;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();

    typeormRepository.find.mockResolvedValue([entity]);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('template-id');
    expect(typeormRepository.find).toHaveBeenCalledWith({
      order: { updatedAt: 'DESC' },
    });
  });
});
