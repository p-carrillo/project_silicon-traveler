# AGENTS

## Purpose
Photo preparation and publishing pipeline orchestration.

## Responsibilities
- Prepare photos by using the shared research use case, gathering same-journey narrative history, generating checked editorial content, creating images, and storing assets.
- Publish prepared photos and update route point status.
- Persist photo metadata, the selected visual brief, original prompt, and provider-revised prompt in MariaDB.

## Boundaries
- No HTTP handling.
- No direct scheduling (handled by `apps/scheduler`).

## Entry Points
- `src/index.ts`
- `src/application/prepare-photo.use-case.ts`
- `src/application/prepare-next-photo.use-case.ts`
- `src/application/prepare-photo-prompts.use-case.ts`
- `src/application/publish-photo.use-case.ts`
- `src/adapters/mariadb-photo.repository.ts`

## Key Flows
- Prepare photo from a `route_points` row, persist its visual brief and prompt audit data, and update status to `image_ready`.
- Prepare the next photo by ensuring a pending `route_points` entry exists (create + enrich if needed), loading a bounded same-journey narrative history, and running the full photo pipeline.
- Prepare the next photo in prompts-only mode to stop after content generation (`content_generated`).
- Publish a prepared photo into the `photos` table and mark `route_points` as `published`.

## Dependencies
- `@silicon-traveler/route`
- `@silicon-traveler/research`
- `@silicon-traveler/content`
- `@silicon-traveler/image`
- `@silicon-traveler/storage`
- `@silicon-traveler/shared`

## Configuration
- `DB_*` variables for MariaDB.
- `OPENAI_API_KEY` for generation.
- `WIKIPEDIA_USER_AGENT` (optional) for research requests.

## Commands
- `pnpm --filter @silicon-traveler/photo build`
- `pnpm --filter @silicon-traveler/photo dev`
- `pnpm --filter @silicon-traveler/photo test`

## Tests
- `packages/photo/test`
