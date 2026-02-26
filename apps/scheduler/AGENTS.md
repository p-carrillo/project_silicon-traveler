# AGENTS

## Purpose
Cron-based job runner that generates and publishes photos on a schedule.

## Responsibilities
- Run generator job to fill the photo buffer.
- Run publisher job to publish photos and refresh map state.
- Keep MariaDB connections clean on shutdown.

## Boundaries
- No HTTP server.
- No direct user interaction.

## Entry Points
- `src/index.ts`
- `src/run-once.ts`
- `src/jobs/generator.job.ts`
- `src/jobs/publisher.job.ts`

## Key Flows
- Generator job prepares photos using the shared next-photo pipeline (same as CLI).
- Publisher job writes `photos` and calls `/api/map/refresh`.

## Dependencies
- `@silicon-traveler/shared`
- `@silicon-traveler/journey`
- `@silicon-traveler/route`
- `@silicon-traveler/research`
- `@silicon-traveler/content`
- `@silicon-traveler/image`
- `@silicon-traveler/storage`
- `@silicon-traveler/photo`

## Configuration
- `API_URL` and `API_KEY` for notifying the API after publish.
- `OPENAI_API_KEY` for generation.
- `WIKIPEDIA_USER_AGENT` (optional) for research requests.
- `DB_*` variables for MariaDB.

## Commands
- `pnpm --filter @silicon-traveler/scheduler build`
- `pnpm --filter @silicon-traveler/scheduler dev`
- `pnpm --filter @silicon-traveler/scheduler start`
- `pnpm --filter @silicon-traveler/scheduler run-once -- --job generator|publisher|all`

## Tests
- Unit tests: `test/unit/run-once-options.test.ts`
- Run: `pnpm --filter @silicon-traveler/scheduler test`
