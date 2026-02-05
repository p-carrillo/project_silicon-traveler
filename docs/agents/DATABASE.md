# Database

## Overview
- MariaDB with direct SQL, no ORM.
- Shared pool lives in `packages/shared/src/database/pool.ts`.
- Migrations live in `migrations/` and are versioned SQL files.

## Tables
| Table | Purpose | Related Module | Migration |
| --- | --- | --- | --- |
| `migrations` | Tracks applied migrations | Core | `20260202100000_create_migrations_table.sql` |
| `journey` | Journey origin, current position, heading | `@silicon-traveler/journey` | `20260202100001_create_journey_table.sql` |
| `route_points` | Route points, research data, content, status | `@silicon-traveler/route` | `20260202100002_create_route_points_table.sql` |
| `route_point_translations` | Multilingual prompts and narratives per route point | `@silicon-traveler/route` | `20260205120000_create_route_point_translations_table.sql` |
| `photos` | Published photos metadata | `@silicon-traveler/photo` | `20260202100003_create_photos_table.sql` |
| `photo_translations` | Multilingual photo metadata | `@silicon-traveler/photo` | `20260205120010_create_photo_translations_table.sql` |
| `map_state` | Global map viewport and refresh state | `@silicon-traveler/map` | `20260203120000_create_map_state_table.sql` |

## Key Relationships
- `route_points.journey_id` references `journey.id`.
- `route_point_translations.route_point_id` references `route_points.id`.
- `photos.route_point_id` references `route_points.id`.
- `photo_translations.photo_id` references `photos.id`.

## Status Flow
`route_points.status` is an enum with values `pending`, `researched`, `content_generated`, `image_ready`, `published`, `failed`.

## Repositories
- Journey: `packages/journey/src/adapters/mariadb-journey.repository.ts`
- Route: `packages/route/src/adapters/mariadb-route.repository.ts`
- Photo: `packages/photo/src/adapters/mariadb-photo.repository.ts`
- Map: `packages/map/src/adapters/mariadb-map-state.repository.ts`, `packages/map/src/adapters/mariadb-photo-pins.repository.ts`

## Migration Workflow
- Add a new SQL file in `migrations/` using the format `YYYYMMDDHHMMSS_description.sql`.
- Keep migrations idempotent and backward compatible when possible.
- Apply via `pnpm script:db:migrate` or `./scripts/docker-run.sh node scripts/run-migrations.js`.
