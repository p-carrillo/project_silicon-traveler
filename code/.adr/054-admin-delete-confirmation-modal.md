# ADR 054: Admin Delete Confirmation Modal

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
Deleting route points from the admin panel became available, but the action was immediate.  
Because delete is destructive, admins need an explicit confirmation step to reduce accidental removals.

## Decision
Implement a client-side confirmation modal in the admin edit page:
- Trigger button opens a modal overlay.
- Modal explains irreversibility and requires explicit confirmation.
- Confirm button submits the existing server delete action.

## Alternatives considered
- Browser-native `window.confirm()`.
- Keep immediate delete behavior.
- Add a two-step route (delete page) instead of inline modal.

## Consequences
### Positive
- Lower risk of accidental deletions.
- Keeps delete flow within the current page and server-action architecture.
- Supports localized copy via translation keys.

### Negative
- Adds one more client component and interaction state.
- Slightly more UI complexity in the admin edit page.

### Follow-ups
- Add focus trap for stricter modal accessibility behavior if needed.
