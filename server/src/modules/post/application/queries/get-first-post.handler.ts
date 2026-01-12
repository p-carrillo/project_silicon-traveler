import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFirstPostQuery } from './get-first-post.query';
import { Post } from '../../domain/entities/post.entity';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';

@QueryHandler(GetFirstPostQuery)
export class GetFirstPostHandler implements IQueryHandler<GetFirstPostQuery> {
  constructor(
    @Inject('IPostRepository')
    private readonly repository: IPostRepository,
  ) {}

  async execute(): Promise<Post | null> {
    return this.repository.findFirst();
  }
}
