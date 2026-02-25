# Debugging

## Quick Checks
- `docker compose ps` to confirm services are running.
- `docker compose logs -f api` for HTTP errors and query failures.
- `docker compose logs -f scheduler` for generator and publisher runs.
- `docker compose logs -f web` for frontend runtime errors.
- `pnpm script:db:migrate` to ensure schema is up to date.

## Common Issues
- MariaDB connection failures usually mean `DB_HOST`, `DB_USER`, or `DB_PASSWORD` are incorrect.
- API returns 401 in non-development when `API_KEY` is missing or mismatched.
- OpenAI or Brave calls fail when `OPENAI_API_KEY` or `BRAVE_SEARCH_API_KEY` are missing.
- Missing images are often caused by the `/images` directory not being writable or not mounted.
- Scheduler publish failures can happen when `API_URL` does not resolve inside Docker.

## Useful Scripts
- `scripts/run-migrations.js` and `scripts/reset-db.js` for DB state.
- `scripts/test-db.js` for connection validation.
- `scripts/test-journey.js`, `scripts/test-route.js`, `scripts/test-api.sh` for focused checks.
- `pnpm --filter @silicon-traveler/cli publish-seed-point --journey-id 1 --no-map-refresh` for quick end-to-end publish checks without external AI APIs.
