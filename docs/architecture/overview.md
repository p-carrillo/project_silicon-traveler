# Architecture Overview

## System Architecture

This monorepo contains a **Next.js frontend** and a **NestJS backend** following hexagonal architecture principles.

```
┌─────────────────┐
│   Next.js       │
│   (Client)      │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   NestJS        │
│   (Server)      │
│   Port: 3001    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MariaDB       │
│   Port: 3306    │
└─────────────────┘
```

## Backend Module Structure (Hexagonal)

Each module follows a layered hexagonal architecture:

### Domain Layer
- **Entities**: Business objects with identity
- **Repository Interfaces**: Ports for data access
- **Domain Services**: Pure business logic
- No dependencies on external frameworks

### Application Layer
- **Queries**: Read operations (CQRS)
- **Commands**: Write operations (CQRS)
- **Handlers**: Execute queries/commands
- Orchestrates domain services

### Infrastructure Layer
- **Controllers**: HTTP endpoints (REST)
- **Persistence**: Repository implementations (TypeORM)
- **DTOs**: Data transfer objects for API
- Adapters to external systems

## Data Flow

```
HTTP Request
    ↓
Controller (Infrastructure)
    ↓
Query/Command → Bus (Application)
    ↓
Handler (Application)
    ↓
Domain Service (Domain)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Infrastructure)
    ↓
Database
```

## Technology Stack

### Frontend
- Next.js 14
- React 18
- TypeScript

### Backend
- NestJS 10
- TypeScript
- CQRS (@nestjs/cqrs)
- TypeORM

### Database
- MariaDB 11

### Infrastructure
- Docker & Docker Compose
- PNPM workspace
