# ADR 027 - Tolerate Overpass Failures in Prompt Preparation

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
The Overpass API (OpenStreetMap) is rate-limited and can return 504 timeouts. During prompt preparation, failures in water detection or nearby city lookup should not abort the entire command.

## Decision
In the `prepare-prompts` CLI command, wrap Overpass-dependent calls (water detection, city lookup, and geocoding) with safe fallbacks:
- `isWater` defaults to `false`
- `city` defaults to `null`
- `geocoding` defaults to `null`
Errors are logged as warnings and the command continues.

## Alternatives considered
- Fail fast on Overpass errors: rejected due to poor developer experience during outages.
- Add retries globally in the adapter: deferred until we have clearer rate limits and backoff policy.

## Consequences
### Positive
- Prompt preparation proceeds even when Overpass is unstable.
- Reduced manual retries for developers.

### Negative
- Some route points will have less accurate context (missing city or ferry info).

### Follow-ups
- Consider a configurable retry/backoff strategy in OverpassAdapter.
