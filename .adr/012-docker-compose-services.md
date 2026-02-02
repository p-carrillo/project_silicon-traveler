# ADR 012: Docker Compose starts core services

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
`docker compose up` only started MariaDB and an idle app container. Developers had to exec into the app container to run API and web processes manually, which made the default workflow confusing and hid expected logs.

## Decision
Add dedicated `api` and `web` services to `docker-compose.yml` so `docker compose up` starts the core runtime (DB, API, web). Keep the `app` service as a shell/utility container for scripts. Add a `scheduler` service behind a `scheduler` profile to avoid running background jobs and external API calls by default.

## Alternatives considered
- Keep a single `app` container and document manual `docker compose exec` commands.
- Replace `app` with one service running a process supervisor for API/web/scheduler.
- Put all services in the default profile (including scheduler).

## Consequences
### Positive
- `docker compose up` now brings up the web UI and API immediately.
- Logs are visible per service (`api`, `web`, `mariadb`).
- Scheduler can be enabled explicitly when desired.

### Negative
- `app` no longer exposes ports, so manual runs should use the dedicated services.
- Scheduler requires a profile flag and still needs API keys to work.

### Follow-ups
- Document the new compose flow in `README.md`.
