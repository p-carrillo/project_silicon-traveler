# AGENTS

## Purpose
Route point computation and enrichment for the journey path.

## Responsibilities
- Calculate next route point coordinates.
- Enrich points with nearest city, geocoding, and water detection.
- Persist route points in MariaDB.

## Boundaries
- No LLM content generation.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/domain/route-point.entity.ts`
- `src/application/calculate-next-point.use-case.ts`
- `src/application/find-nearest-city.use-case.ts`
- `src/application/geocode-point.use-case.ts`
- `src/application/detect-water.use-case.ts`
- `src/adapters/overpass.adapter.ts`
- `src/adapters/nominatim.adapter.ts`
- `src/adapters/mariadb-route.repository.ts`

## Key Flows
- Compute next coordinate based on heading and distance.
- Use Overpass and Nominatim to enrich place data.

## Dependencies
- `@silicon-traveler/shared` for MariaDB pool and geo helpers.
- Axios for external API calls.

## Configuration
- `DB_*` variables for MariaDB.

## Commands
- `pnpm --filter @silicon-traveler/route build`
- `pnpm --filter @silicon-traveler/route dev`
- `pnpm --filter @silicon-traveler/route test`

## Tests
- `packages/route/test`
