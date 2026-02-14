# ADR 059: Geo Resilience with OSRM Self-Host and Overpass Hardening

**Status:** Accepted  
**Date:** 2026-02-14

## Context
Route generation depends on external geo providers (OSRM and Overpass). Public endpoints can intermittently fail with timeouts (`504`) and throttling (`429`), causing unstable route planning.

We need better operational continuity without changing public API contracts or introducing DB cache complexity.

## Decision
- Keep Overpass public in this phase, but harden client behavior with:
  - selective retries with exponential backoff and jitter,
  - circuit breaker per provider/operation,
  - in-memory TTL/LRU cache.
- Move OSRM to self-hosted Docker service profiles (`routing`, `routing-init`) and default Docker URL to `http://osrm:5000`.
- Keep Nominatim as fallback source for place naming when Overpass city lookup degrades.
- Add structured geo logs with minimal counters for operational visibility.

## Alternatives considered
- Keep all providers public and only increase timeout: rejected (insufficient under provider saturation).
- Self-host Overpass immediately: rejected for operational complexity in this phase.
- Persist geo cache in MariaDB: rejected to avoid schema/maintenance overhead.

## Consequences
### Positive
- Fewer transient geo failures during route generation.
- Reduced dependency on public OSRM availability.
- Controlled degraded behavior with clear observability.

### Negative
- Additional Docker operational step for OSRM dataset bootstrap.
- In-memory cache resets on container restart.

## Follow-ups
- Evaluate self-hosted Overpass after observing production metrics.
- Add optional persistent cache if memory cache hit rates justify it.
- Consider route-provider failover to managed OSRM endpoint if local service is unavailable.
