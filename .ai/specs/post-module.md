# Feature Spec: Post Module with Database Integration

## Overview
Implement a simple post module that demonstrates the hexagonal architecture with database persistence. The feature retrieves a string value from MariaDB and displays it in the frontend.

## Technical Requirements

### Database
- **Technology**: MariaDB 11
- **Table**: `post`
- **Schema**:
  ```sql
  id INT PRIMARY KEY AUTO_INCREMENT
  value VARCHAR(255) NOT NULL
  ```
- **Fixtures**: One record with value = "DB works"

### Backend (NestJS)

#### Module Structure
```
src/modules/post/
├── domain/
│   ├── entities/
│   │   └── post.entity.ts              # Domain entity
│   └── repositories/
│       └── post.repository.interface.ts # Repository interface (port)
├── application/
│   └── queries/
│       ├── get-first-post.query.ts      # Query class
│       └── get-first-post.handler.ts    # Query handler
└── infrastructure/
    ├── controllers/
    │   └── post.controller.ts           # REST controller
    ├── persistence/
    │   ├── entities/
    │   │   └── post.typeorm-entity.ts   # TypeORM entity
    │   └── repositories/
    │       └── post.repository.ts        # Repository implementation
    └── dto/
        └── post-response.dto.ts          # Response DTO
```

#### Implementation Details

**Domain Entity**:
```typescript
export class Post {
  constructor(
    public readonly id: number,
    public readonly value: string,
  ) {}
}
```

**Repository Interface (Port)**:
```typescript
export interface IPostRepository {
  findFirst(): Promise<Post | null>;
}
```

**Query**:
```typescript
export class GetFirstPostQuery {}
```

**Query Handler**:
- Inject IPostRepository via DI
- Execute query to get first post
- Return domain entity

**Controller**:
- Endpoint: `GET /posts/first`
- Uses QueryBus to dispatch GetFirstPostQuery
- Returns post value

**Repository Implementation**:
- Uses TypeORM
- Implements IPostRepository interface
- Maps TypeORM entity to domain entity

### Frontend (Next.js)

#### Changes to Home Page
- Fetch data from `http://server:3001/posts/first` on server side
- Display the post value in a separate card
- Card titled "DB check"
- 24px margin between "Backend health" and "DB check" cards
- Error handling if API fails

#### Expected Output
```
It works!

Card 1 - Backend health:
  ok

Card 2 - DB check:
  DB works
```

## Acceptance Criteria

### Database
- [ ] MariaDB container runs in docker-compose
- [ ] Database initialized with fixtures on startup
- [ ] Table `post` exists with one record

### Backend
- [ ] POST module follows hexagonal architecture
- [ ] CQRS pattern implemented with @nestjs/cqrs
- [ ] Repository interface in domain layer
- [ ] Repository implementation in infrastructure layer
- [ ] TypeORM entity separate from domain entity
- [ ] GET /posts/first endpoint returns correct data
- [ ] Tests pass (optional for boilerplate)

### Frontend
- [ ] Page fetches data from backend API
- [ ] DB value displayed on homepage
- [ ] Graceful error handling if API fails
- [ ] Works in Docker environment

### Docker
- [ ] docker-compose includes MariaDB service
- [ ] Server connects to database successfully
- [ ] Fixtures run automatically on first start
- [ ] All services start with `docker compose up --build`

## Dependencies

### Backend Packages
```json
{
  "@nestjs/cqrs": "^10.x",
  "@nestjs/typeorm": "^10.x",
  "typeorm": "^0.3.x",
  "mysql2": "^3.x"
}
```

### Environment Variables
```
DB_HOST=mariadb
DB_PORT=3306
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=app
```

## Out of Scope
- Authentication/authorization
- Post creation, update, or deletion
- Pagination
- Multiple posts
- Complex business logic
- Production-grade error handling

## Notes
- This is a minimal example to demonstrate architecture
- Focus on structure over features
- Keep it simple but correct
- Use as template for future modules
