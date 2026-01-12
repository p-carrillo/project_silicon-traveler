import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './infrastructure/controllers/post.controller';
import { PostEntity } from './infrastructure/persistence/entities/post.typeorm-entity';
import { PostRepository } from './infrastructure/persistence/repositories/post.repository';
import { GetFirstPostHandler } from './application/queries/get-first-post.handler';

const queryHandlers = [GetFirstPostHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PostEntity]),
  ],
  controllers: [PostController],
  providers: [
    ...queryHandlers,
    {
      provide: 'IPostRepository',
      useClass: PostRepository,
    },
  ],
})
export class PostModule {}
