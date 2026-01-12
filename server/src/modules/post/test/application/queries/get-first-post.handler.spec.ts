import { Test, TestingModule } from '@nestjs/testing';
import { GetFirstPostHandler } from '../../../application/queries/get-first-post.handler';
import { GetFirstPostQuery } from '../../../application/queries/get-first-post.query';
import { IPostRepository } from '../../../domain/repositories/post.repository.interface';
import { Post } from '../../../domain/entities/post.entity';

describe('GetFirstPostHandler', () => {
  let handler: GetFirstPostHandler;
  let mockRepository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    mockRepository = {
      findFirst: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFirstPostHandler,
        {
          provide: 'IPostRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetFirstPostHandler>(GetFirstPostHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return a post when repository finds one', async () => {
    const mockPost = new Post(1, 'DB works');
    mockRepository.findFirst.mockResolvedValue(mockPost);

    const result = await handler.execute();

    expect(result).toEqual(mockPost);
    expect(mockRepository.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should return null when repository finds no post', async () => {
    mockRepository.findFirst.mockResolvedValue(null);

    const result = await handler.execute();

    expect(result).toBeNull();
    expect(mockRepository.findFirst).toHaveBeenCalledTimes(1);
  });
});
