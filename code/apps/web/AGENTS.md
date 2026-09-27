# AGENTS

## Purpose
Next.js frontend that renders the journey narrative, photo grid, and map UI.

## Responsibilities
- Fetch photos and map state from the API.
- Render the public website.
- Provide client-side map and grid interactions.

## Boundaries
- No direct database access.
- No background jobs.

## Entry Points
- `src/app`
- `src/components`
- `src/lib`
- `src/types`

## Key Flows
- Fetch latest photo and photo lists from `/api/photos`.
- Fetch map pins and map state from `/api/map`.

## Dependencies
- Next.js, React, Tailwind CSS.
- API endpoints exposed by `apps/api`.

## Configuration
- `NEXT_PUBLIC_API_URL` for browser-side API calls.

## Commands
- `pnpm --filter @silicon-traveler/web dev`
- `pnpm --filter @silicon-traveler/web build`
- `pnpm --filter @silicon-traveler/web start`
- `pnpm --filter @silicon-traveler/web lint`

## Tests
- `apps/web/test`
