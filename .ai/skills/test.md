# TEST SKILL

## Scope
Testing strategy and implementation for the Silicon Traveler monorepo.

## Testing Framework
- **Vitest** as the test runner (configured in `scripts/vitest.config.mjs`)
- Configuration supports both unit and integration tests
- Runs in Node.js environment with globals enabled

## Test Organization

### Structure
```
packages/<module>/
  test/
    unit/              # Pure unit tests (no external dependencies)
      application/     # Use case tests with mocks
      domain/          # Domain logic tests
    integration/       # Integration tests (real dependencies)
      adapters/        # Adapter tests with real services
      application/     # Use case tests with real adapters
```

### File Naming
- Test files must end with `.test.ts`
- Name should mirror the tested file: `foo.service.ts` → `foo.service.test.ts`
- Place tests in the corresponding `test/unit/` or `test/integration/` subdirectory

## Testing Principles

### 1. Unit Tests
**Purpose**: Test business logic in isolation

**Characteristics**:
- No real database connections
- No real API calls
- No file system operations
- Use mocks/stubs for all ports/adapters
- Fast execution (< 100ms per test)

**Example**:
```typescript
describe('CreateJourneyUseCase', () => {
  it('should create a journey with valid data', () => {
    const mockRepository = { save: vi.fn() };
    const useCase = new CreateJourneyUseCase(mockRepository);
    // Test logic with mocked dependencies
  });
});
```

### 2. Integration Tests
**Purpose**: Test real interactions with external systems

**Characteristics**:
- Use real adapters (database, APIs, file system)
- Test actual integration behavior
- May be slower (network, I/O)
- Can be skipped in CI with environment checks

**Example**:
```typescript
describe('MariaDBJourneyRepository (integration)', () => {
  it('should save and retrieve a journey from database', async () => {
    const pool = createPool(); // Real DB connection
    const repository = new MariaDBJourneyRepository(pool);
    // Test with real database
  });
});
```

### 3. Skip Strategy for Integration Tests
Integration tests should be skipped when dependencies are unavailable:

```typescript
// Pattern used in this project:
const shouldRunDbTests = Boolean(process.env.DB_HOST);
const dbIt = shouldRunDbTests ? it : it.skip;

describe('Database tests', () => {
  dbIt('should query the database', async () => {
    // Test that requires database
  });
});

// For API key dependent tests:
const shouldRunOpenAI = Boolean(process.env.OPENAI_API_KEY);
const openaiIt = shouldRunOpenAI ? it : it.skip;

describe('OpenAI tests', () => {
  openaiIt('should generate content', async () => {
    // Test that requires OpenAI API
  });
});
```

## Best Practices

### Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange: Set up test data and dependencies
  const input = { /* test data */ };
  const mockDep = createMock();
  
  // Act: Execute the code under test
  const result = functionUnderTest(input, mockDep);
  
  // Assert: Verify the result
  expect(result).toBe(expectedValue);
});
```

### Naming Conventions
- Use descriptive test names: `it('should return empty array when no data exists')`
- Group related tests: `describe('when user is authenticated', () => {})`
- Use nested describes for context: `describe('UseCaseName', () => { describe('methodName', () => {}) })`

### Mocking with Vitest
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock a port/interface
const mockPort = {
  method: vi.fn().mockResolvedValue(someValue),
};

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Verify mock calls
expect(mockPort.method).toHaveBeenCalledWith(expectedArgs);
expect(mockPort.method).toHaveBeenCalledTimes(1);
```

### Test Data
- Use factory functions for complex test data
- Keep test data minimal and focused
- Use meaningful values (avoid `foo`, `bar`)

```typescript
function createTestJourney(overrides = {}) {
  return {
    id: 'test-journey-1',
    name: 'Test Journey',
    startDate: '2026-01-01',
    ...overrides,
  };
}
```

### Assertions
- One logical assertion per test (but multiple expect calls are OK)
- Use specific matchers: `toBeCloseTo()`, `toContain()`, `toMatchObject()`
- Test both happy path and edge cases
- Test error handling

```typescript
// Good: Specific and clear
expect(distance).toBeCloseTo(15.5, 1);
expect(cities).toHaveLength(3);
expect(result).toMatchObject({ status: 'success' });

// Bad: Too generic
expect(result).toBeTruthy();
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run tests in watch mode
pnpm exec vitest -c scripts/vitest.config.mjs

# Run tests for specific package
pnpm --filter @silicon-traveler/journey test
```

## Coverage Goals
- **Unit tests**: Aim for 80%+ coverage of business logic
- **Integration tests**: Cover critical paths and external integrations
- **Domain entities**: 100% coverage (core business rules)
- **Use cases**: 90%+ coverage (main application logic)
- **Adapters**: Integration tests for real behavior, unit tests for error handling

## What to Test

### ✅ Always Test
- Business logic in domain entities
- Use case orchestration
- Error handling and validation
- Edge cases and boundary conditions
- Data transformations
- Complex algorithms (e.g., Haversine calculations)

### ❌ Don't Test
- Third-party libraries
- Simple getters/setters without logic
- Framework code
- Type definitions

## Common Patterns

### Testing Use Cases
```typescript
describe('PreparePhotoUseCase', () => {
  let useCase: PreparePhotoUseCase;
  let mockPhotoRepo: IPhotoRepository;
  let mockRouteUseCase: ICalculateNextPointUseCase;
  
  beforeEach(() => {
    mockPhotoRepo = { /* mock methods */ };
    mockRouteUseCase = { execute: vi.fn() };
    useCase = new PreparePhotoUseCase(mockPhotoRepo, mockRouteUseCase);
  });
  
  it('should prepare a photo with next route point', async () => {
    // Arrange
    mockRouteUseCase.execute.mockResolvedValue(nextPoint);
    
    // Act
    const result = await useCase.execute(journeyId);
    
    // Assert
    expect(result.status).toBe('researching');
    expect(mockPhotoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'researching' })
    );
  });
});
```

### Testing Adapters
```typescript
describe('BraveSearchAdapter', () => {
  it('should return empty results when API key is missing', async () => {
    const adapter = new BraveSearchAdapter('');
    const results = await adapter.search('query');
    expect(results).toEqual([]);
  });
  
  it.skipIf(!process.env.BRAVE_API_KEY)('should fetch real results', async () => {
    const adapter = new BraveSearchAdapter(process.env.BRAVE_API_KEY!);
    const results = await adapter.search('Valencia Spain');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## CI/CD Considerations
- All unit tests must pass before merge
- Integration tests can be skipped if dependencies unavailable
- Use environment variables for API keys in CI
- Consider test parallelization for faster feedback

## Troubleshooting

### Tests timing out
- Check for missing `await` in async tests
- Increase timeout: `it('test', () => {}, { timeout: 10000 })`
- Verify mocks are resolving correctly

### Flaky tests
- Avoid time-dependent assertions
- Use `vi.useFakeTimers()` for time-based logic
- Reset state between tests with `beforeEach`

### Module resolution issues
- Check aliases in `scripts/vitest.config.mjs`
- Verify TypeScript path mappings match Vitest config
- Use absolute imports from package roots
