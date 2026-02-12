# ADR 049: Enforce Admin Basic Auth in Development

**Status:** Superseded by ADR 050  
**Date:** 2026-02-12  

## Context
The web middleware protected `/admin` with HTTP Basic Auth only outside development. In development, `/admin` was open without credentials, which made accidental unauthorized access possible in local/shared environments.

## Decision
Remove the development bypass and enforce the same Basic Auth check for `/admin` in every environment. If `ADMIN_BASIC_USER` or `ADMIN_BASIC_PASSWORD` is missing, keep returning `404` to avoid exposing an auth surface by default.

## Alternatives considered
- Keep `/admin` open in development for convenience.
- Add a toggle env var (for example, `ADMIN_AUTH_DISABLED`) to bypass auth selectively.

## Consequences
### Positive
- Consistent security behavior between development and production for admin access.
- Prevents unauthorized access to `/admin` in development when services are reachable on a local network.

### Negative
- Requires credentials in `.env` to access admin routes during development.
- Slightly less convenience for local debugging sessions.

### Follow-ups
- Keep `ADMIN_BASIC_USER` and `ADMIN_BASIC_PASSWORD` documented in environment docs and examples.
