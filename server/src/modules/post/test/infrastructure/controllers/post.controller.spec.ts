import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../../../infrastructure/controllers/post.controller';
import { QueryBus } from '@nestjs/cqrs';
import { GetFirstPostQuery } from '../../../application/queries/get-first-post.query';
import { Post } from '../../../domain/entities/post.entity';
import { NotFoundException } from '@nestjs/common';

describe('PostController', () => {
  let controller: PostController;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    queryBus = module.get(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFirstPost', () => {
    it('should return post response when post exists', async () => {
      const mockPost = new Post(1, 'DB works');
      queryBus.execute.mockResolvedValue(mockPost);

      const result = await controller.getFirstPost();

      expect(result).toEqual({ id: 1, value: 'DB works' });
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetFirstPostQuery));
    });

    it('should throw NotFoundException when no post found', async () => {
      queryBus.execute.mockResolvedValue(null);

      await expect(controller.getFirstPost()).rejects.toThrow(NotFoundException);
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetFirstPostQuery));
    });
  });
});
