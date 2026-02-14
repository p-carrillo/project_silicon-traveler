# Environment

## Source of Truth
- `.env.example` defines the expected variables.
- `docker-compose.yml` provides container defaults and port mappings.

## Variables
| Variable | Used By | Purpose | Default/Notes |
| --- | --- | --- | --- |
| `DB_HOST` | All services | MariaDB host | Default `mariadb` in Docker.
| `DB_PORT` | Host tooling | MariaDB host port | Default `3316` on host, `3306` in containers.
| `DB_USER` | All services | MariaDB user | Required.
| `DB_PASSWORD` | All services | MariaDB password | Required.
| `DB_NAME` | All services | MariaDB database name | Required.
| `DB_POOL_SIZE` | `@silicon-traveler/shared` | MariaDB pool size | Default `10` in Docker.
| `DB_ROOT_PASSWORD` | MariaDB container | Root password | Required for container bootstrap.
| `API_KEY` | API, scheduler | API auth for non-dev and map refresh | Required in production.
| `ADMIN_BASIC_USER` | Web | Admin login username for `/admin/login` | Required to expose admin UI.
| `ADMIN_BASIC_PASSWORD` | Web | Admin login password for `/admin/login` | Required to expose admin UI.
| `ADMIN_SESSION_SECRET` | Web | HMAC signing secret for admin session cookie | Required; admin routes return 404 when missing.
| `CORS_ORIGINS` | API | Allowed origins for CORS | Comma-separated list.
| `API_URL` | Scheduler, web | Base API URL | Default `http://api:3000` in Docker.
| `NEXT_PUBLIC_API_URL` | Web | Public API URL for browser | Example `http://localhost:3010`.
| `STORAGE_DIR` | Scheduler, API | Local image storage root | Default resolves to repo `images/` when unset.
| `SEED_PHOTOS_SOURCE_DIR` | `scripts/seed-photos.js` | Local source folder for seed image files | Default `.ai/pictures_seed` (relative to repo root).
| `I18N_LANGUAGES` | API, web, scheduler | Enabled UI/content languages | Default `es,en`.
| `I18N_DEFAULT_LANGUAGE` | API, web, scheduler | Fallback UI/content language | Default `es`.
| `I18N_CONTENT_BASE_LANGUAGE` | Content, photo | Base language for LLM generation | Default `en`.
| `OPENAI_API_KEY` | content, image, photo | OpenAI for text and image generation | Required for real runs.
| `IMAGE_MODEL` | image | OpenAI image generation model | Default `gpt-image-1.5`. Options: `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`, `dall-e-3`, `dall-e-2`.
| `BRAVE_SEARCH_API_KEY` | research, photo | Brave Search API | Required for real runs.
| `OSRM_BASE_URL` | route, cli, scheduler | Base URL for OSRM route planning API | Default `http://osrm:5000` in Docker; can be overridden to a public endpoint.
| `OSRM_TIMEOUT_MS` | route, cli, scheduler | Timeout for OSRM requests | Default `5000`.
| `OSRM_PBF_URL` | Docker bootstrap | Source URL for OSRM dataset download | Default Geofabrik Spain extract.
| `OSRM_PBF_FILE` | Docker bootstrap/osrm service | PBF filename stored under OSRM data volume | Default `spain-latest.osm.pbf`.
| `OVERPASS_BASE_URL` | route, cli, scheduler | Base URL for Overpass API | Default `https://overpass-api.de/api/interpreter`.
| `OVERPASS_TIMEOUT_MS` | route, cli, scheduler | Timeout for Overpass requests | Default `5000`.
| `GEO_RETRY_MAX_ATTEMPTS` | route adapters | Max retry attempts for transient geo provider failures | Default `3`.
| `GEO_RETRY_BASE_DELAY_MS` | route adapters | Base retry backoff delay | Default `200`.
| `GEO_RETRY_MAX_DELAY_MS` | route adapters | Max retry backoff delay | Default `2000`.
| `GEO_CIRCUIT_FAILURE_THRESHOLD` | route adapters | Consecutive failures before opening circuit | Default `5`.
| `GEO_CIRCUIT_OPEN_MS` | route adapters | Circuit open duration | Default `120000`.
| `GEO_CACHE_MAX_ENTRIES` | route adapters | Max in-memory geo cache entries per adapter cache | Default `2000`.
| `GEO_CACHE_TTL_MS_WATER` | Overpass adapter | TTL for water-detection cache entries | Default `86400000`.
| `GEO_CACHE_TTL_MS_CITY` | Overpass adapter | TTL for nearest-city cache entries | Default `21600000`.
| `GEO_CACHE_TTL_MS_ROUTE` | Routing adapter | TTL for OSRM route cache entries | Default `3600000`.
| `ROUTE_EAST_BEARING_MIN` | route, cli, scheduler | Minimum eastward candidate bearing (degrees) | Default `65`.
| `ROUTE_EAST_BEARING_MAX` | route, cli, scheduler | Maximum eastward candidate bearing (degrees) | Default `115`.
| `ROUTE_LANDFALL_SAMPLE_KM` | route, cli, scheduler | Sampling distance for eastward landfall scan | Default `25`.
| `ROUTE_LANDFALL_MAX_KM` | route, cli, scheduler | Maximum eastward scan distance before giving up on air fallback | Default `1500`.

## Runtime Defaults
- `docker-compose.yml` sets `NODE_ENV=development` for containers.
- API is exposed at `http://localhost:3010` and Web at `http://localhost:3011` in Docker.

## Notes
- API key enforcement is disabled when `NODE_ENV=development` in the API service.
- Web middleware enforces authenticated sessions on `/admin` in all environments.
- `/admin` and `/admin/login` are fail-closed (404) if `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASSWORD`, or `ADMIN_SESSION_SECRET` is missing.
- Admin login attempts are rate-limited in web app memory: 5 failed attempts in 15 minutes block for 15 minutes.
- Scheduler calls `API_URL` to refresh map state after publishing.
