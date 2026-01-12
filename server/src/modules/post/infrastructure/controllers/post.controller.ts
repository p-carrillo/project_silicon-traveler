import { Controller, Get, Inject, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetFirstPostQuery } from '../../application/queries/get-first-post.query';
import { PostResponseDto } from '../dto/post-response.dto';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  @Get('first')
  async getFirstPost(): Promise<PostResponseDto> {
    const post = await this.queryBus.execute(new GetFirstPostQuery());
    
    if (!post) {
      throw new NotFoundException('No posts found');
    }

    return new PostResponseDto(post.id, post.value);
  }
}
