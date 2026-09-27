# ADR 035: Local Images Path and Dev API Access

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
Local runs need scheduler-generated images to appear in the web UI and the map refresh call to succeed. We observed two issues:
- Images were saved outside the repo or referenced through a non-proxy path, so the web app could not load them reliably.
- The API was running with production auth in Docker Compose, causing unauthorized requests from the web app and map refresh failures during local development.

## Decision
- Default local storage to the repo images directory (or `STORAGE_DIR` when explicitly set).
- Use the web `/api/images/...` proxy route for journal and archive images.
- Run the API service in development mode in Docker Compose to avoid API key enforcement for local development.

## Alternatives considered
- Keep API key enforcement and inject a server-side API key into all web requests.
- Keep the storage adapter default at `/images` and bind-mount it separately.

## Consequences
### Positive
- Local image files are consistently written and served from the repo `images/` folder.
- Web image requests work through the existing proxy route.
- Local development works without additional API key plumbing.

### Negative
- Development mode disables API key enforcement in Docker Compose.
- Requires a small config difference between local and production.

### Follow-ups
- Ensure production deployments explicitly set `NODE_ENV=production` and `API_KEY`.
- Consider documenting a dedicated production storage path if needed.
