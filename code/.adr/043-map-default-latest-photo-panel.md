# ADR 043: Map Side Panel Defaults to Latest Published Photo

**Status:** Accepted  
**Date:** 2026-02-07  

## Context

The `/map` page only showed photo metadata in the side panel after a user selected a pin. This left the panel empty on initial load, even when published photos already existed. The homepage already exposes a clear "latest published photo" concept via `GET /api/photos/latest`.

We need a consistent, immediate experience on `/map` without changing map navigation behavior.

## Decision

Load the latest published photo on the map page server-side and pass it to the map client component as fallback panel content.

Panel priority rules:
- If a pin is selected, show the selected pin data.
- If no pin is selected, show the latest published photo.
- If no published photo exists, keep the empty-state helper text.

No map recentering or auto-selection is performed.

## Alternatives considered

- Keep current behavior and only show content after pin selection.
- Auto-select the latest photo pin and move map viewport on load.
- Add a separate "Latest photo" panel section instead of reusing selected frame section.

## Consequences

### Positive
- `/map` has meaningful content immediately when photos exist.
- Behavior is consistent with existing latest-photo semantics used on homepage.
- Keeps current interaction model: manual pin selection still takes precedence.

### Negative
- `/map` now performs one extra server-side read (`GET /api/photos/latest`) on page load.
- Side panel content may not correspond to currently visible pins until a pin is selected.

### Follow-ups
- Optionally link the fallback panel photo to `/photo/YYYY-MM-DD` for quick navigation.
- Consider periodic refresh of fallback photo when the map remains open for long sessions.
