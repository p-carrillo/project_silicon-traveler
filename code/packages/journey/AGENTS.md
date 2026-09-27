# AGENTS

## Purpose
Journey domain model and persistence for the around-the-world walk.

## Responsibilities
- Model journey entity state and behavior.
- Provide use cases for creation, stats, and position updates.
- Persist journey data in MariaDB.

## Boundaries
- No HTTP or UI concerns.
- No route point calculations.

## Entry Points
- `src/index.ts`
- `src/domain/journey.entity.ts`
- `src/application/create-journey.use-case.ts`
- `src/application/get-journey-stats.use-case.ts`
- `src/application/update-journey-position.use-case.ts`
- `src/adapters/mariadb-journey.repository.ts`

## Key Flows
- Create journey with origin and heading.
- Update current position as route points are generated.

## Dependencies
- `@silicon-traveler/shared` for MariaDB pool.

## Configuration
- `DB_*` variables for MariaDB.

## Commands
- `pnpm --filter @silicon-traveler/journey build`
- `pnpm --filter @silicon-traveler/journey dev`
- `pnpm --filter @silicon-traveler/journey test`

## Tests
- `packages/journey/test`
