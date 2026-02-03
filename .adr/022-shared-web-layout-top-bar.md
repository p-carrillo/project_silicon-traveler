# ADR 022: Shared Web Layout and Top Bar

**Status:** Accepted  
**Date:** 2026-02-03  

## Context
Journal, Archive, and Map pages rendered with different content widths, header fonts, and top bar layouts. The logo was missing on Archive and Map. This made the UI feel inconsistent and forced repeated layout tweaks per page.

## Decision
Create shared layout primitives for the web frontend:
- `PageContainer` + `.page-container` CSS class to standardize page width and horizontal gutters.
- `SectionTopBar` component to render the logo, section title, and navigation with consistent typography and sizing across sections.
- Update Journal, Archive, and Map to use the shared components and align navigation typography.

## Alternatives considered
- Keep per-page headers and only normalize Tailwind classes manually.
- Use a CSS-only solution without shared React components.
- Introduce a full layout wrapper per route instead of a reusable top bar.

## Consequences
### Positive
- Consistent widths and header typography across sections.
- Logo and navigation are unified and easier to maintain.
- Fewer duplicated layout definitions.

### Negative
- Existing header aesthetics changed to match the shared style.
- Section-specific header variants may require additional props in the future.

### Follow-ups
- If a section needs a unique subtitle or action area, extend `SectionTopBar` with optional slots.
