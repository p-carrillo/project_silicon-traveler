# ADR 065: Use a local random global-place catalog for the Admin E2E photo batch

**Status:** Accepted
**Date:** 2026-09-24

## Context

The development-only Admin E2E photo batch needs real, globally varied places before it starts costly provider calls. Selecting exactly ten places with an LLM added cost and non-deterministic structured-output failures without improving the photo pipeline under test.

## Decision

Use a versioned, local catalog of 300 city locations derived from the GeoNames `cities5000`, `countryInfo`, and `admin1CodesASCII` extracts. The catalog records place, country, region, and continent and attributes GeoNames under CC BY 4.0.

An API adapter selects places with Node.js `crypto.randomInt`, guarantees distinct countries, and selects from each represented continent before filling the remaining slots. The selector is injected into the batch use case; no catalog data is persisted or fetched at runtime.

## Alternatives considered

- Ask an LLM to select each batch.
- Store the catalog in MariaDB.
- Generate random coordinates and resolve them through an external geographic service.

## Consequences

### Positive

- Removes a provider call and its malformed-output failure mode from every batch.
- Keeps the harness fast, offline for selection, and independent of persistent data.
- Guarantees basic global and country diversity.

### Negative

- The catalog requires an intentional refresh and editorial review when it becomes stale.
- It does not reproduce an individual batch because the random choice is not seeded.
