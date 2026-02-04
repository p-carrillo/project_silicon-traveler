# Golden Paths

## 1. Initialize a Journey (CLI)
1. Apply migrations with `pnpm --filter @silicon-traveler/cli migrate`.
2. Create the journey and initial route points with `pnpm --filter @silicon-traveler/cli init-journey`.
3. Verify `journey` and `route_points` rows exist in MariaDB.

## 2. Prepare Photos (CLI)
1. Ensure `OPENAI_API_KEY` and `BRAVE_SEARCH_API_KEY` are set.
2. Run `pnpm --filter @silicon-traveler/cli prepare-prompts -- 7 --journey-id 1`.
3. The command prints JSON with prepared photo details and updates `route_points` status to `image_ready`.
4. Use `--prompts-only` to stop after content generation (`content_generated`).
5. If the place name remains `Unknown`, the pipeline marks the route point as `failed` and throws.

## 3. Generate and Publish Photos (Scheduler)
1. Start `apps/scheduler` with the scheduler profile or run `pnpm --filter @silicon-traveler/scheduler build` then `pnpm --filter @silicon-traveler/scheduler start`.
2. The generator job fills a buffer of `route_points` and updates statuses to `image_ready`.
3. The publisher job creates rows in `photos` and calls `/api/map/refresh` to update map state.

## 4. Web UI Fetches Content (API + Web)
1. Start `apps/api` and `apps/web` via `pnpm dev` or Docker.
2. Web calls `/api/photos/latest`, `/api/photos`, and `/api/map/pins` to render the grid and map.
3. API serves images from `/images` and returns photo metadata with coordinates and tags.
