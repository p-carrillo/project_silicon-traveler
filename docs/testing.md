# Testing Guide

## Overview

This project uses Jest as the testing framework for both backend and frontend.
All tests run inside Docker containers.

## Backend Testing (NestJS)

### Setup

- **Framework**: Jest with ts-jest
- **Location**: Tests are colocated with source files (`*.spec.ts`)
- **E2E Tests**: Located in `/server/test/` directory

### Running Tests (Docker-only)

```bash
# Ensure containers are running
docker compose up -d --build

# Unit tests
docker compose exec server pnpm test

# Watch mode
docker compose exec server pnpm test:watch

# Coverage
docker compose exec server pnpm test:cov

# E2E tests
docker compose exec server pnpm test:e2e
```

### Test Structure

#### Unit Tests

Unit tests focus on individual components in isolation:

```typescript
// Example: Handler test
describe('GetFirstPostHandler', () => {
  let handler: GetFirstPostHandler;
  let mockRepository: jest.Mocked<IPostRepository>;

  beforeEach(async () => {
    // Setup with mocked dependencies
  });

  it('should return a post when repository finds one', async () => {
    // Test logic
  });
});
```

**What to test:**
- Query/Command handlers with mocked repositories
- Controllers with mocked QueryBus/CommandBus
- Domain logic and entities
- Repository implementations with mocked TypeORM

#### Integration Tests (E2E)

E2E tests verify the full application flow:

```typescript
describe('PostController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/posts/first (GET)', () => {
    return request(app.getHttpServer())
      .get('/posts/first')
      .expect(200);
  });
});
```

**What to test:**
- HTTP endpoints
- Full request/response cycle
- Database integration
- Error handling

### Best Practices

1. **Mock external dependencies**: Use jest.Mock for TypeORM repositories
2. **Test business logic**: Focus on domain and application layers
3. **Keep tests simple**: One assertion per test when possible
4. **Use descriptive names**: Test names should describe the scenario
5. **Follow AAA pattern**: Arrange, Act, Assert

## Frontend Testing (Next.js)

### Setup

- **Framework**: Jest with React Testing Library
- **Environment**: jsdom
- **Location**: Tests are colocated with components (`*.test.tsx`)

### Running Tests (Docker-only)

```bash
# Ensure containers are running
docker compose up -d --build

# Unit tests
docker compose exec client pnpm test

# Watch mode
docker compose exec client pnpm test:watch

# Coverage
docker compose exec client pnpm test:cov
```

### Test Structure

#### Component Tests

```typescript
import { render, screen } from '@testing-library/react';

describe('Home Page', () => {
  it('renders the main heading', async () => {
    const component = await Home();
    render(component);

    const heading = screen.getByRole('heading', { name: /it works/i });
    expect(heading).toBeInTheDocument();
  });
});
```

**What to test:**
- Component rendering
- User interactions
- Conditional rendering
- Error states
- API integration (mocked)

### Best Practices

1. **Test user behavior**: Focus on what users see and do
2. **Mock external APIs**: Use `jest.fn()` for fetch calls
3. **Query by role/text**: Prefer accessible queries (getByRole, getByText)
4. **Avoid implementation details**: Don't test internal state
5. **Test error scenarios**: Always test error handling

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Before deployments

## Common Patterns

### Mocking TypeORM Repository

```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};
```

### Mocking CQRS Bus

```typescript
const mockQueryBus = {
  execute: jest.fn(),
};
```

### Mocking Fetch

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
);
```

## Troubleshooting

### Tests not finding modules

Check `moduleNameMapper` in jest.config.js/ts

### TypeORM issues in tests

Use mocked repositories instead of real database connections for unit tests

### Next.js server components

Use async/await pattern and render the resolved component

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
