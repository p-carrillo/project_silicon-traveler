# AGENTS

## Purpose
Shared MariaDB pool and geographic utilities used across modules.

## Responsibilities
- Initialize and export the MariaDB connection pool.
- Provide shared geographic helpers and types.

## Boundaries
- No domain logic beyond shared utilities.
- No HTTP or UI concerns.

## Entry Points
- `src/index.ts`
- `src/database/pool.ts`
- `src/database/geographic.ts`

## Key Flows
- Create MariaDB pool using `DB_*` environment variables.
- Provide distance and coordinate helpers.

## Dependencies
- `mariadb` driver.

## Configuration
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_POOL_SIZE`.

## Commands
- `pnpm --filter @silicon-traveler/shared build`
- `pnpm --filter @silicon-traveler/shared dev`
- `pnpm --filter @silicon-traveler/shared test`

## Tests
- `packages/shared/test`
