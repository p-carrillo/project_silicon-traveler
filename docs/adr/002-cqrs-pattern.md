# ADR 002: CQRS with NestJS

**Status:** Accepted  
**Date:** 2026-01-11  
**Context:** We need a pattern to separate read and write operations.

## Decision

We will use **CQRS (Command Query Responsibility Segregation)** via NestJS CQRS module.

## Implementation

- Use `@nestjs/cqrs` for command and query buses
- Queries: Read operations (e.g., GetPostQuery)
- Commands: Write operations (e.g., CreatePostCommand)
- Handlers process queries and commands
- Controllers only dispatch to buses

## Example

```typescript
// Controller
@Get()
async getPost(@Param('id') id: string) {
  return this.queryBus.execute(new GetPostQuery(id));
}

// Query
export class GetPostQuery {
  constructor(public readonly id: string) {}
}

// Handler
@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  async execute(query: GetPostQuery) { ... }
}
```

## Consequences

- **Positive**: Clear separation between reads and writes
- **Positive**: Easier to scale read and write operations independently
- **Positive**: Better alignment with event-driven architecture if needed
- **Negative**: Additional abstraction layer for simple operations
