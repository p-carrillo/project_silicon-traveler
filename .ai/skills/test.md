# Testing Guidelines

## Overview
This document defines the conventions and best practices for writing and organizing tests in the project.

## Test Structure

### Test Location

#### Unit and Integration Tests
Unit and integration tests must be located **inside the module itself** in a `test/` folder that replicates the module's structure.

**Example: Post Module**
```
server/src/modules/post/
├── domain/
│   ├── entities/
│   │   └── post.entity.ts
│   └── repositories/
│       └── post.repository.interface.ts
├── application/
│   └── queries/
│       ├── get-first-post.query.ts
│       └── get-first-post.handler.ts
├── infrastructure/
│   ├── controllers/
│   │   └── post.controller.ts
│   ├── dto/
│   │   └── post-response.dto.ts
│   └── persistence/
│       ├── entities/
│       │   └── post.typeorm-entity.ts
│       └── repositories/
│           └── post.repository.ts
├── post.module.ts
└── test/                              # ← Module test folder
    ├── domain/
    │   └── entities/
    │       └── post.entity.spec.ts
    ├── application/
    │   └── queries/
    │       └── get-first-post.handler.spec.ts
    ├── infrastructure/
    │   ├── controllers/
    │   │   └── post.controller.spec.ts
    │   ├── dto/
    │   │   └── post-response.dto.spec.ts
    │   └── persistence/
    │       └── repositories/
    │           └── post.repository.spec.ts
    └── post.module.spec.ts
```

**Rules:**
1. Create a `test/` folder inside the module
2. Replicate the module's folder structure inside `test/`
3. Each class/file has its own `.spec.ts` file in the corresponding location
4. Imports must point to the actual classes using relative paths

#### Tests E2E (End-to-End)
Los tests E2E que prueban múltiples módulos o la aplicación completa se ubican en `server/test/` o `client/test/`.

**Ejemplo:**
```
server/
├── src/
│   └── modules/
│       └── post/
│           └── test/              # Tests unitarios/integración del módulo
│               └── ...
└── test/                          # Global E2E tests
    ├── app.e2e-spec.ts           # General health E2E test
    ├── post.e2e-spec.ts          # Complete post flow E2E test
    └── jest-e2e.json
```

## Naming Conventions

### Test Files
- **Extension:** `.spec.ts` (NestJS/Jest convention)
- **Name:** Must match the file being tested
  - Class: `post.entity.ts` → Test: `post.entity.spec.ts`
  - Service: `post.service.ts` → Test: `post.service.spec.ts`
  - Controller: `post.controller.ts` → Test: `post.controller.spec.ts`

### Suites de Test (describe)
```typescript
// For classes
describe('PostEntity', () => { ... });

// For modules
describe('PostModule', () => { ... });

// For methods (nested describes)
describe('PostRepository', () => {
  describe('findFirst', () => { ... });
});
```

### Test Cases (it)
Use clear and specific descriptions in English:
```typescript
it('should return a domain Post when entity is found', async () => { ... });
it('should return null when no entity is found', async () => { ... });
it('should throw NotFoundException when post does not exist', async () => { ... });
```

## Test Types

### 1. Unit Tests
**Location:** `modules/{module}/test/`
**Purpose:** Test individual classes in isolation

**Characteristics:**
- Mock all dependencies
- Fast (no I/O, no DB)
- Test pure business logic

**Example:**
```typescript
// modules/post/test/application/queries/get-first-post.handler.spec.ts
describe('GetFirstPostHandler', () => {
  let handler: GetFirstPostHandler;
  let repository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findFirst: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GetFirstPostHandler,
        { provide: 'IPostRepository', useValue: mockRepository },
      ],
    }).compile();

    handler = module.get(GetFirstPostHandler);
    repository = module.get('IPostRepository');
  });

  it('should return post when found', async () => {
    const post = new Post(1, 'test');
    repository.findFirst.mockResolvedValue(post);

    const result = await handler.execute(new GetFirstPostQuery());

    expect(result).toBe(post);
  });
});
```

### 2. Integration Tests
**Location:** `modules/{module}/test/`
**Purpose:** Test interaction between module components

**Characteristics:**
- Use in-memory DB (better-sqlite3)
- Test complete module
- Verify dependency wiring

**Example:**
```typescript
// modules/post/test/post.module.spec.ts
describe('PostModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [PostEntity],
          synchronize: true,
        }),
        PostModule,
      ],
    }).compile();
  });

  it('should provide PostController', () => {
    const controller = module.get(PostController);
    expect(controller).toBeDefined();
  });
});
```

### 3. E2E Tests
**Location:** `test/` (global)
**Purpose:** Test complete application flows

**Characteristics:**
- In-memory DB or test container
- Real HTTP requests
- Test integrations between modules

**Example:**
```typescript
// test/post.e2e-spec.ts
describe('PostController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/posts/first (GET)', () => {
    return request(app.getHttpServer())
      .get('/posts/first')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('value');
      });
  });
});
```

## AAA Pattern (Arrange-Act-Assert)

Organize each test in three clear sections:

```typescript
it('should return post when found', async () => {
  // Arrange: Preparar datos y mocks
  const post = new Post(1, 'test value');
  repository.findFirst.mockResolvedValue(post);

  // Act: Ejecutar la acción a testear
  const result = await handler.execute(new GetFirstPostQuery());

  // Assert: Verificar el resultado
  expect(result).toBe(post);
  expect(repository.findFirst).toHaveBeenCalledTimes(1);
});
```

## Mocking

### Repositories (Ports)
```typescript
const mockRepository: jest.Mocked<IPostRepository> = {
  findFirst: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
};
```

### CQRS (QueryBus/CommandBus)
```typescript
const mockQueryBus: jest.Mocked<QueryBus> = {
  execute: jest.fn(),
} as any;
```

### TypeORM Repository
```typescript
const mockTypeOrmRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// En providers
{
  provide: getRepositoryToken(PostEntity),
  useValue: mockTypeOrmRepository,
}
```

## Jest Configuration

### Unit Tests (jest.config.js)
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

### E2E (test/jest-e2e.json)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

## Commands

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Generate coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

## Testing Checklist

When creating a new module, ensure:

- [ ] Create `test/` folder inside the module
- [ ] Replicate folder structure in `test/`
- [ ] Test for each domain entity
- [ ] Test for each query handler
- [ ] Test for each command handler
- [ ] Test for each controller
- [ ] Test for each repository (adapter)
- [ ] Test for complete module (wiring)
- [ ] E2E test in global `test/` if applicable

## Coverage Examples

**Coverage target:** 80% minimum

**Priorities:**
1. **High priority:** Domain entities, handlers, services
2. **Medium priority:** Controllers, repositories
3. **Low priority:** DTOs, interfaces, configuration

## References

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Library](https://testing-library.com/)
