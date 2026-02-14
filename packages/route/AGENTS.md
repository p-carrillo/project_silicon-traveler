# AGENTS

## Purpose
Route point computation and enrichment for the journey path.

## Responsibilities
- Calculate next route point coordinates.
- Plan eastward movement over land with routing geometry.
- Resolve eastward air landing fallback when sea blocks land progression.
- Enrich points with nearest city, geocoding, and water detection.
- Apply resilience patterns for geo providers (retry/backoff, circuit breaker, cache, degraded fallbacks).
- Persist route points in MariaDB.

## Boundaries
- No LLM content generation.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/domain/route-point.entity.ts`
- `src/application/calculate-next-point.use-case.ts`
- `src/application/plan-eastward-step.use-case.ts`
- `src/application/find-air-landing-east.use-case.ts`
- `src/application/find-nearest-city.use-case.ts`
- `src/application/geocode-point.use-case.ts`
- `src/application/detect-water.use-case.ts`
- `src/adapters/overpass.adapter.ts`
- `src/adapters/routing.adapter.ts`
- `src/adapters/resilient-http.client.ts`
- `src/adapters/ttl-lru-cache.ts`
- `src/adapters/nominatim.adapter.ts`
- `src/adapters/mariadb-route.repository.ts`

## Key Flows
- Compute next coordinate based on heading and distance.
- For east heading, prefer routed land movement and interpolate the next point along route geometry.
- When no eastward land route is found, sample eastward landfall and jump by air.
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
