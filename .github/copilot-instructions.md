# GitHub Copilot Instructions

## Context
This is a Node.js + TypeScript monorepo with a modular hexagonal architecture and MariaDB without an ORM (direct SQL and connections). The codebase follows SOLID principles and widely adopted TypeScript standards.

## Primary Documentation Entry Points
Before making changes, consult:
1. **[AGENTS.md](../AGENTS.md)** - Global agent rules, skills ordering, and orchestration guidelines
2. **[docs/agents/INDEX.md](../docs/agents/INDEX.md)** - Complete index of agent-facing documentation
3. **[README.md](../README.md)** - Setup and operational commands

## Documentation Structure
- `docs/agents/ENVIRONMENT.md`: Environment variables and defaults
- `docs/agents/DATABASE.md`: Database schema overview and migrations
- `docs/agents/GOLDEN_PATHS.md`: End-to-end flows for the product
- `docs/agents/DEBUGGING.md`: Common issues and diagnostics
- `docs/agents/DOCKER.md`: Docker deployment and operations guide
- Each app and package has its own `AGENTS.md` with specific context

## Skills & Best Practices
Core skills are located in `.ai/skills/`:
- `architecture.md`: Modular hexagonal architecture patterns
- `database.md`: MariaDB queries, migrations, and connection handling
- `coding.md`: TypeScript coding standards and patterns
- `test.md`: Unit and integration testing guidelines
Specialized skills:
- `.ai/skills/docker-security-audit.md`: Docker security audit workflow

### Orchestration Order
For multi-area changes, follow this sequence:
1. Architecture (structure, ports, dependencies)
2. Database (schema, migrations)
3. Coding (implementation)
4. Testing (unit/integration tests)
5. Documentation (README updates)

## Global Rules
- **README**: Update [README.md](../README.md) when changes affect setup, architecture, usage, dependencies, configuration, or commands
- **ADR**: Record technical/architectural decisions in `.adr/` folder using the appropriate template
- **Tests**: Every feature or change requires unit and/or integration tests
- **Consistency**: Maintain modular hexagonal architecture and MariaDB without ORM
- **Language**: Keep UI copy and documentation in English
- **Agent Docs**: Update `docs/agents/INDEX.md` and module-level `AGENTS.md` files when adding/removing modules or apps

## Architecture Overview
```
apps/          - Application entrypoints (API, CLI, Scheduler, Web)
packages/      - Domain modules and shared libraries
migrations/    - MariaDB schema migrations
scripts/       - Dev, test, and Docker helpers
```

### Key Packages
- `content`: LLM content generation
- `image`: Image generation and thumbnailing
- `journey`: Journey domain model
- `map`: Map state and photo pins
- `photo`: Photo preparation and publishing
- `research`: Brave search adapter
- `route`: Route point computation
- `shared`: MariaDB pool and utilities
- `storage`: Storage ports and adapters

## Coding Conventions
- Use hexagonal architecture (domain, application, ports, adapters)
- Follow SOLID principles
- No ORM - use direct SQL with MariaDB connection pool
- TypeScript strict mode enabled
- Prefer composition over inheritance
- Keep modules loosely coupled via ports/interfaces

## Testing Strategy
- Unit tests for domain logic and use cases
- Integration tests for database operations
- Test files colocated in `test/` directories
- Use Vitest as the test runner
- Mock external dependencies at port boundaries

## Development Workflow
1. Consult relevant AGENTS.md files before making changes
2. Follow the skills orchestration order for complex work
3. Write tests alongside implementation
4. Update documentation when behavior changes
5. Create ADRs for architectural decisions

## References
- Module-specific context: Check `AGENTS.md` in each app/package
- Environment setup: [docs/agents/ENVIRONMENT.md](../docs/agents/ENVIRONMENT.md)
- Database schema: [docs/agents/DATABASE.md](../docs/agents/DATABASE.md)
- Common issues: [docs/agents/DEBUGGING.md](../docs/agents/DEBUGGING.md)
