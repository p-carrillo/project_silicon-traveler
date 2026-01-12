# ADR 001: Hexagonal Architecture

**Status:** Accepted  
**Date:** 2026-01-11  
**Context:** We need a scalable architecture that separates business logic from infrastructure concerns.

## Decision

We will use **Hexagonal Architecture (Ports & Adapters)** for the server module structure.

## Structure

```
src/
└── modules/
    └── {module-name}/
        ├── domain/          # Business logic & entities
        │   ├── entities/
        │   └── repositories/  # Repository interfaces (ports)
        ├── application/     # Use cases & orchestration
        │   ├── queries/
        │   └── commands/
        └── infrastructure/  # External adapters
            ├── controllers/
            ├── persistence/   # Repository implementations
            └── dto/
```

## Rationale

- **Domain** contains pure business logic with no dependencies on frameworks
- **Application** orchestrates use cases using domain services
- **Infrastructure** implements adapters for external systems (HTTP, DB, etc.)
- Repository interfaces in domain, implementations in infrastructure
- Clear separation of concerns and testability

## Consequences

- **Positive**: Testable, maintainable, framework-independent business logic
- **Positive**: Easy to swap infrastructure (e.g., change DB or framework)
- **Negative**: More boilerplate for simple CRUD operations
- **Negative**: Steeper learning curve for new developers
