# AGENTS

## Purpose
HTTP API for photos, journey state, and map state. Also serves generated images from `/images`.

## Responsibilities
- Expose REST endpoints for photos, journey, and map state.
- Enforce CORS, rate limits, and optional API key auth.
- Serve static images for the web client.

## Boundaries
- No UI rendering.
- No background generation jobs (handled by scheduler).

## Entry Points
- `src/index.ts`
- `src/routes/photos.routes.ts`
- `src/routes/journey.routes.ts`
- `src/routes/map.routes.ts`
- `src/routes/health.routes.ts`

## Key Flows
- `GET /api/photos` and `GET /api/photos/latest` read from `photos`.
- `POST /api/map/refresh` updates `map_state` after publish.

## Dependencies
- `@silicon-traveler/shared`
- `@silicon-traveler/journey`
- `@silicon-traveler/route`
- `@silicon-traveler/photo`
- `@silicon-traveler/map`

## Configuration
- `PORT` default is `3000`.
- `API_KEY` required outside development.
- `CORS_ORIGINS` controls allowed origins.

## Commands
- `pnpm --filter @silicon-traveler/api dev`
- `pnpm --filter @silicon-traveler/api build`
- `pnpm --filter @silicon-traveler/api start`

## Tests
- `apps/api/test`
