import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRepository } from '../../../../infrastructure/persistence/repositories/post.repository';
import { PostEntity } from '../../../../infrastructure/persistence/entities/post.typeorm-entity';
import { Post } from '../../../../domain/entities/post.entity';

describe('PostRepository', () => {
  let postRepository: PostRepository;
  let typeormRepository: jest.Mocked<Repository<PostEntity>>;

  beforeEach(async () => {
    const mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostRepository,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    postRepository = module.get<PostRepository>(PostRepository);
    typeormRepository = module.get(getRepositoryToken(PostEntity));
  });

  it('should be defined', () => {
    expect(postRepository).toBeDefined();
  });

  describe('findFirst', () => {
    it('should return a domain Post when entity is found', async () => {
      const mockEntity = new PostEntity();
      mockEntity.id = 1;
      mockEntity.value = 'DB works';

      typeormRepository.findOne.mockResolvedValue(mockEntity);

      const result = await postRepository.findFirst();

      expect(result).toBeInstanceOf(Post);
      expect(result?.id).toBe(1);
      expect(result?.value).toBe('DB works');
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: {},
        order: { id: 'ASC' },
      });
    });

    it('should return null when no entity is found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await postRepository.findFirst();

      expect(result).toBeNull();
      expect(typeormRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should map TypeORM entity to domain entity correctly', async () => {
      const mockEntity = new PostEntity();
      mockEntity.id = 42;
      mockEntity.value = 'Test Value';

      typeormRepository.findOne.mockResolvedValue(mockEntity);

      const result = await postRepository.findFirst();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(42);
      expect(result?.value).toBe('Test Value');
    });
  });
});
