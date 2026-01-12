# Module Structure Guide

## Creating a New Module

Follow this structure for each new module. Paths are relative to `server/`.

```
src/modules/{module-name}/
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts
│   └── repositories/
│       └── {entity}.repository.interface.ts
├── application/
│   ├── queries/
│   │   ├── {query}.query.ts
│   │   └── {query}.handler.ts
│   └── commands/
│       ├── {command}.command.ts
│       └── {command}.handler.ts
└── infrastructure/
    ├── controllers/
    │   └── {module}.controller.ts
    ├── persistence/
    │   ├── entities/
    │   │   └── {entity}.entity.ts  # TypeORM entity
    │   └── repositories/
    │       └── {entity}.repository.ts  # Implementation
    └── dto/
        ├── {request}.dto.ts
        └── {response}.dto.ts
```

## Layer Rules

### Domain
- ✅ Contains pure TypeScript classes
- ✅ Defines repository interfaces
- ❌ No imports from NestJS
- ❌ No imports from TypeORM
- ❌ No imports from infrastructure

### Application
- ✅ Uses domain entities and interfaces
- ✅ Implements queries and commands
- ✅ Can use NestJS CQRS decorators
- ❌ No direct database access
- ❌ No HTTP/framework-specific code

### Infrastructure
- ✅ Implements domain repository interfaces
- ✅ Contains controllers and DTOs
- ✅ Uses TypeORM entities
- ✅ Handles HTTP requests/responses
- ✅ Can import from domain and application
- ❌ Domain should never import from here

## Example: Post Module

```typescript
// domain/entities/post.entity.ts
export class Post {
  constructor(
    public readonly id: string,
    public readonly value: string,
  ) {}
}

// domain/repositories/post.repository.interface.ts
export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
}

// application/queries/get-post.query.ts
export class GetPostQuery {
  constructor(public readonly id: string) {}
}

// application/queries/get-post.handler.ts
@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(
    @Inject('IPostRepository')
    private readonly repository: IPostRepository,
  ) {}

  async execute(query: GetPostQuery): Promise<Post> {
    return this.repository.findById(query.id);
  }
}

// infrastructure/controllers/post.controller.ts
@Controller('posts')
export class PostController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.queryBus.execute(new GetPostQuery(id));
  }
}
```
