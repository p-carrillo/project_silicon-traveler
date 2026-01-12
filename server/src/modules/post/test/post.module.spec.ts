import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '../post.module';
import { PostController } from '../infrastructure/controllers/post.controller';
import { PostRepository } from '../infrastructure/persistence/repositories/post.repository';
import { GetFirstPostHandler } from '../application/queries/get-first-post.handler';

describe('PostModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        CqrsModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          username: process.env.DB_USERNAME || 'user',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'app',
          entities: [__dirname + '/../../**/*.typeorm-entity{.ts,.js}'],
          synchronize: false,
        }),
        PostModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide PostController', () => {
    const controller = module.get<PostController>(PostController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(PostController);
  });

  it('should provide GetFirstPostHandler', () => {
    const handler = module.get<GetFirstPostHandler>(GetFirstPostHandler);
    expect(handler).toBeDefined();
    expect(handler).toBeInstanceOf(GetFirstPostHandler);
  });

  it('should provide IPostRepository', () => {
    const repository = module.get('IPostRepository');
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(PostRepository);
  });

  it('should have CQRS module imported', () => {
    const cqrsModule = module.get(CqrsModule);
    expect(cqrsModule).toBeDefined();
  });
});
