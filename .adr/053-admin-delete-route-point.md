# ADR 053: Admin Delete Route Point

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
The admin panel allowed creating and editing route points but had no direct delete action.  
For operational cleanup, admins need to remove mistaken or obsolete route points without manual database access.

## Decision
Add delete support end-to-end:
- Backend endpoint: `DELETE /api/admin/route-points/:id`.
- Route module use case: `DeleteRoutePointAdminUseCase`.
- Admin web UI: `Delete` button on route point edit page.

The delete is executed in the backend repository layer and relies on existing foreign-key cascade behavior for dependent rows.

## Alternatives considered
- Keep delete as a manual SQL operation only.
- Soft delete with a status flag instead of physical delete.
- Restrict delete to non-published points only.

## Consequences
### Positive
- Faster and safer admin workflow for data cleanup.
- No direct DB access needed for routine corrections.
- Consistent with existing admin server-action flow.

### Negative
- Deletion is irreversible from the UI.
- Accidental deletes are possible without an extra confirmation modal.

### Follow-ups
- Consider adding client-side confirmation dialog before submit.
- Consider role-based restrictions for delete in production.
