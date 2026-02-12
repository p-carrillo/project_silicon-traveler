# ADR 055: Admin Route Point Status Toggle

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
The admin edit page allowed content and coordinate updates, but publication control required implicit status handling.  
Operators needed a direct way to see current route-point status and toggle public visibility without leaving the editor.

## Decision
Add explicit status visibility and a publish/unpublish switch in the admin route-point editor.

Transition behavior:
- When enabled, route point status is set to `published`.
- When disabled from `published`, status is set to `image_ready`.
- The API keeps `published_at` aligned with status transitions.
- When unpublishing, the linked `photos` record is removed so content disappears from archive/map responses.
- When publishing an existing published point update, photo metadata is synchronized from route-point data.

## Alternatives considered
- Keep status hidden and rely on implicit backend transitions.
- Add a dedicated publish/unpublish endpoint separate from edit updates.
- Keep photo rows on unpublish and filter visibility elsewhere.

## Consequences
### Positive
- Clearer admin UX: status is visible and publication intent is explicit.
- Faster moderation workflow from a single edit form.
- Consistent public visibility behavior across archive and map.

### Negative
- More transition logic in admin update flow.
- Unpublish now has a destructive side effect (photo record deletion).

### Follow-ups
- Add optional soft-unpublish strategy if restoring previously unpublished photos without recreation becomes necessary.
