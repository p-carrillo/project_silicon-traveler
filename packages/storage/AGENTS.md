# AGENTS

## Purpose
Storage abstraction and local filesystem adapter for images and thumbnails.

## Responsibilities
- Save images and thumbnails under a date-based path.
- Provide storage port for use cases.

## Boundaries
- No database access.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/application/save-image.use-case.ts`
- `src/application/save-thumbnails.use-case.ts`
- `src/adapters/local-storage.adapter.ts`

## Key Flows
- Save original image and derived thumbnails to `/images`.
- Return URLs for persisted assets.

## Dependencies
- Node.js filesystem APIs.

## Configuration
- Base directory defaults to `/images` in `LocalStorageAdapter`.

## Commands
- `pnpm --filter @silicon-traveler/storage build`
- `pnpm --filter @silicon-traveler/storage dev`
- `pnpm --filter @silicon-traveler/storage test`

## Tests
- `packages/storage/test`
