# Nest + Next Monorepo Boilerplate

Minimal monorepo with a Nest backend and a Next frontend. The frontend shows an "It works" page and reads a basic health check from the backend.

## Requirements
- Docker

## Development (Docker-only)
```bash
docker compose up -d --build
```

- App: http://localhost:8010
 - Runs the client and server in dev mode with hot reload.

## Testing
```bash
# Ensure containers are running
docker compose up -d --build

# Run all server tests
docker compose exec server pnpm test

# Run server tests in watch mode
docker compose exec server pnpm test:watch

# Run server tests with coverage
docker compose exec server pnpm test:cov

# Run server E2E tests
docker compose exec server pnpm test:e2e

# Run all client tests
docker compose exec client pnpm test

# Run client tests in watch mode
docker compose exec client pnpm test:watch

# Run client tests with coverage
docker compose exec client pnpm test:cov
```

See [docs/testing.md](docs/testing.md) for detailed testing guide.

## Database fixtures
```bash
# Ensure containers are running
docker compose up -d --build

# Re-apply the initial fixtures
docker compose exec server pnpm db:fixtures
```

You can override the host ports:
```bash
CLIENT_PORT=8020 SERVER_PORT=3022 docker compose up --build
```

## Notes
- See [docs/testing.md](docs/testing.md) for testing guide.
- See [docs/architecture/](docs/architecture/) for architecture documentation.
- See [docs/adr/](docs/adr/) for architectural decisions.
