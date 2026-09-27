# AGENTS

## Purpose
Map state and photo pin queries for the web UI.

## Responsibilities
- Persist and retrieve map viewport state.
- Query photo pins by bounding box.
- Refresh map state after photo publication.

## Boundaries
- No HTTP handling.
- No photo generation.

## Entry Points
- `src/index.ts`
- `src/domain/map-state.entity.ts`
- `src/domain/photo-pin.entity.ts`
- `src/application/get-map-state.use-case.ts`
- `src/application/save-map-state.use-case.ts`
- `src/application/search-photo-pins-by-bbox.use-case.ts`
- `src/application/refresh-map.use-case.ts`
- `src/adapters/mariadb-map-state.repository.ts`
- `src/adapters/mariadb-photo-pins.repository.ts`

## Key Flows
- Fetch and update map viewport state.
- Search pins by bounding box for map rendering.

## Dependencies
- `@silicon-traveler/shared` for MariaDB pool.

## Configuration
- `DB_*` variables for MariaDB.

## Commands
- `pnpm --filter @silicon-traveler/map build`
- `pnpm --filter @silicon-traveler/map dev`
- `pnpm --filter @silicon-traveler/map test`

## Tests
- `packages/map/test`
