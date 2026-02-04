# AGENTS

## Purpose
CLI for database migrations and journey setup workflows.

## Responsibilities
- Apply MariaDB migrations.
- Initialize the journey and seed route points.
- Prepare photos for a number of days using the same pipeline as the Scheduler.

## Boundaries
- No HTTP server.
- No persistent background jobs.

## Entry Points
- `src/index.ts`
- `src/commands/migrate.ts`
- `src/commands/init-journey.ts`
- `src/commands/prepare-prompts.ts`

## Key Flows
- `st migrate` applies SQL migrations.
- `st init-journey` creates the journey and initial `route_points`.
- `st prepare-prompts <days> --journey-id <id>` enriches route points, generates prompts, and creates images.
  Use `--prompts-only` to skip image generation and stop at `content_generated`.

## Dependencies
- `@silicon-traveler/shared`
- `@silicon-traveler/journey`
- `@silicon-traveler/route`
- `@silicon-traveler/research`
- `@silicon-traveler/content`
- `@silicon-traveler/image`
- `@silicon-traveler/photo`
- `@silicon-traveler/storage`

## Configuration
- `DB_*` variables for MariaDB.
- `OPENAI_API_KEY` and `BRAVE_SEARCH_API_KEY` for prompt preparation and image generation.

## Commands
- `pnpm --filter @silicon-traveler/cli build`
- `pnpm --filter @silicon-traveler/cli dev`
- `pnpm --filter @silicon-traveler/cli migrate`
- `pnpm --filter @silicon-traveler/cli init-journey`
- `pnpm --filter @silicon-traveler/cli prepare-prompts -- 7 --journey-id 1`
- `pnpm --filter @silicon-traveler/cli prepare-prompts -- 7 --journey-id 1 --prompts-only`

## Tests
- `apps/cli/test`
