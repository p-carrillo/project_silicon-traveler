# ADR 056: Transactional Admin Route Point Update and Delete

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
The admin route-point update flow touched multiple tables (`route_points`, `route_point_translations`, `photos`, `photo_translations`) and mixed those writes with business branching in HTTP handlers.

A failure in a later step could leave partial writes already committed (for example, route point updated but photo sync/publish incomplete).

Delete operations also removed the DB row but did not guarantee image cleanup orchestration in the same workflow.

## Decision
Introduce explicit admin application use cases in `apps/api` that orchestrate updates/deletes and execute all DB writes in a single transaction using `runInTransaction` from `@silicon-traveler/shared`.

Implemented decisions:
- Add `UpdateAdminRoutePointUseCase` to centralize update/publish/unpublish/sync behavior.
- Add `DeleteAdminRoutePointUseCase` to centralize delete + post-commit storage cleanup.
- Extend MariaDB adapters (`route`, `photo`) to accept a transaction-scoped query executor.
- Keep storage deletion as best-effort compensation after commit (log failures, do not revert DB).
- Keep route handlers thin: validation + use-case delegation.

## Alternatives considered
- Keep sequential non-transactional writes in route handlers.
- Introduce outbox/event processing for eventual consistency.
- Move all admin write orchestration to `packages/*` instead of app-level use cases.

## Consequences
### Positive
- DB consistency for admin update/publish/unpublish/delete paths.
- Clear separation between transport layer and business orchestration.
- Reduced risk of partial write states across route/photo tables.

### Negative
- Additional complexity in adapter APIs (transaction-aware query executor support).
- Storage cleanup remains compensating (not strictly atomic with DB commit).

### Follow-ups
- Consider retryable cleanup queue for storage deletion failures.
- Consider extracting common transactional orchestration primitives if more admin flows need them.
