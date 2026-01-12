import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPostRepository } from '../../../domain/repositories/post.repository.interface';
import { Post } from '../../../domain/entities/post.entity';
import { PostEntity } from '../entities/post.typeorm-entity';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async findFirst(): Promise<Post | null> {
    const entity = await this.postRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!entity) {
      return null;
    }

    return new Post(entity.id, entity.value);
  }
}
