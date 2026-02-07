# ADR 042: Journal Square Image Uses Cover Fit

**Status:** Accepted  
**Date:** 2026-02-07  

## Context

The main journal photo is rendered inside a square frame. With `object-contain`, portrait or non-square images can leave empty bands inside the frame, which reduces visual consistency with the intended full-bleed editorial style.

## Decision

Use `object-cover` (with centered crop) for the main journal image in `apps/web/src/components/photo/PhotoJournal.tsx` so the image always fills the square container.

## Alternatives considered

- Keep `object-contain` and accept empty margins
- Use dynamic per-image aspect-ratio containers

## Consequences

### Positive
- Square frame is always fully filled.
- Visual consistency improves across mixed image aspect ratios.

### Negative
- Some parts of the image are cropped for non-square ratios.

### Follow-ups
- If needed, add optional per-photo focal point metadata to control crop focus.
