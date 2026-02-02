# Skill: architecture.md

## Objective
Define and maintain a modular hexagonal architecture in the monorepo, with clear boundaries, correct dependencies, and stable contracts.

## Scope
- Folder and package structure.
- Layer separation (domain, application, adapters).
- Definition of ports and public contracts between modules.
- Dependency and coupling rules.

## Expected inputs
- Functional and non-functional requirements.
- List of modules and their responsibilities.
- External integrations (DB, queues, APIs, etc.).

## Expected outputs
- Proposed monorepo structure and module layout.
- Ports (interfaces) defined for use cases and integrations.
- Dependency rules between layers.
- An ADR documenting the architectural decision.

## Recommended workflow
1) Identify modules (bounded contexts) and responsibilities.
2) Define layers per module:
   - Domain (entities, value objects, rules).
   - Application (use cases, services).
   - Ports (input/output interfaces).
   - Adapters (infrastructure, controllers, repositories).
3) Set dependencies:
   - Domain does not depend on infrastructure.
   - Adapters depend on ports.
4) Propose monorepo structure. Example layout:
   - apps/ (entrypoints: API, workers, CLI)
   - packages/ (domain modules)
     - <module>/src/domain
     - <module>/src/application
     - <module>/src/ports
     - <module>/src/adapters
5) Define public contracts between modules (DTOs and events).
6) Document the decision in `.adr/`.

## Best practices
- Keep the domain pure: no framework or IO dependencies.
- Use cases as the central orchestration unit.
- Ports as stable boundaries.
- Avoid cross-module coupling; integrate via ports.
- Consistent naming for layers and folders.
- Document structural changes with ADRs.

## Checklist
- [ ] Modules are identified with clear boundaries.
- [ ] Each module separates domain, application, ports, and adapters.
- [ ] No dependencies from domain to infrastructure.
- [ ] Public contracts between modules are defined.
- [ ] The architectural decision is recorded in `.adr/`.
