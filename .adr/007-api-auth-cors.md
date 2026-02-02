# ADR 007: API Key Authentication and CORS Allowlist

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The API was publicly accessible and CORS allowed any origin. This increases exposure to unwanted use and makes it easy for any website to call the API from a browser context. We need a minimal, low‑overhead control that fits the current stack and deployment style.

## Decision
Require an API key for all `/api/*` routes using the `Authorization: Bearer <API_KEY>` header, and restrict CORS to a configurable allowlist via `CORS_ORIGINS`. Non-browser clients without an `Origin` header are allowed.

## Alternatives considered
- Keep the API public and rely only on rate limiting.
- Implement full user auth (JWT/session) and roles.
- Use IP allowlists or mTLS at the edge.

## Consequences
### Positive
- Reduces unauthorized access to API endpoints.
- Prevents arbitrary browser origins from calling the API.
- Simple operational model using environment variables.

### Negative
- Requires managing and distributing an API key.
- No per-client scoping or rotation strategy yet.

### Follow-ups
- Add key rotation and per-client keys if external consumers are added.
- Decide whether `/health` should also require authentication.
