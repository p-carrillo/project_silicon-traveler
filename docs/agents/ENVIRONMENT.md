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
| `WIKIPEDIA_USER_AGENT` | research, photo | Custom User-Agent for Wikipedia requests | Optional; defaults to `silicon-traveler/1.0 (https://github.com)`.

## Runtime Defaults
- `docker-compose.yml` sets `NODE_ENV=development` for containers.
- API is exposed at `http://localhost:3010` and Web at `http://localhost:3011` in Docker.

## Notes
- API key enforcement is disabled when `NODE_ENV=development` in the API service.
- Web middleware enforces authenticated sessions on `/admin` in all environments.
- `/admin` and `/admin/login` are fail-closed (404) if `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASSWORD`, or `ADMIN_SESSION_SECRET` is missing.
- Admin login attempts are rate-limited in web app memory: 5 failed attempts in 15 minutes block for 15 minutes.
- Scheduler calls `API_URL` to refresh map state after publishing.
