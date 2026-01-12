# Hexagonal Architecture Skill

## Purpose
Ensure all server modules follow the project's hexagonal architecture and standard module structure.

## Source of truth
- `docs/architecture/overview.md`
- `docs/architecture/module-structure.md`

## Required module layout
```
server/src/modules/{module-name}/
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
    │   │   └── {entity}.entity.ts
    │   └── repositories/
    │       └── {entity}.repository.ts
    └── dto/
        ├── {request}.dto.ts
        └── {response}.dto.ts
```

## Layer responsibilities
- **Domain**: entities, repository interfaces, domain services; no framework imports.
- **Application**: queries, commands, handlers; can use CQRS decorators; no direct database access.
- **Infrastructure**: controllers, DTOs, persistence adapters; implements domain ports.

## Dependency rules
- Domain: no dependencies on other layers.
- Application: depends on Domain only.
- Infrastructure: depends on Domain and Application.
- Never import Infrastructure from Domain or Application.

## Controller/service rule
- Keep controllers thin; delegate to handlers or services in the Application layer.

## Checklist before finishing changes
- New classes live in the correct layer and folder.
- Imports respect the dependency rules.
- Public API changes stay aligned with client usage.
- Tests follow `.ai/skills/test.md` conventions.
