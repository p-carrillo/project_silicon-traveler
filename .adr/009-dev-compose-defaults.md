# ADR 009: Dev Docker Compose With Safe Defaults

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The main `docker-compose.yml` now requires explicit database credentials and API configuration, which is correct for safety but adds friction for quick local testing. We need a sanctioned dev-only path that does not undermine production safety.

## Decision
Add `docker-compose.dev.yml` that provides local-only default values for database credentials and API key configuration, leaving the main compose file strict and environment-driven.

## Alternatives considered
- Keep a single compose file and require `.env` in all cases.
- Use a `.env.dev` file with `docker compose --env-file`.
- Add defaults back into application code.

## Consequences
### Positive
- Easier local startup without compromising production defaults.
- Clear separation between dev and non-dev configurations.

### Negative
- Two compose files to maintain.

### Follow-ups
- Consider adding a `make dev` or npm script to standardize startup.
