# ADR 008: Require Database Credentials via Environment

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The database connection used fallback credentials in code and hardcoded defaults in Docker Compose. This increases the risk of accidentally running with weak credentials and makes it easy to expose the database if configuration is missed.

## Decision
Remove fallback credentials from the application and require database configuration via environment variables. Docker Compose now reads database credentials from `.env` (`DB_ROOT_PASSWORD`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

## Alternatives considered
- Keep defaults for convenience in development.
- Use a separate dev-only compose file with defaults.
- Use a secrets manager for all environments.

## Consequences
### Positive
- No silent startup with weak defaults.
- Clear, explicit configuration for credentials.

### Negative
- Requires `.env` to be set before starting services.

### Follow-ups
- Consider separate dev/prod compose files or a secrets manager.
