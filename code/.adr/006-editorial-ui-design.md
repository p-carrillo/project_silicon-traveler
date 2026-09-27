# ADR 006: Editorial Dual-Theme Web UI

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The web app needs to align with the reference designs in `.ai/designs`, which depict an editorial dark-mode journal entry and a light-mode archive contact sheet. The current UI is functional but does not reflect the intended visual language.

## Decision
Adopt an editorial dual-theme UI: a dark, cinematic journal page for the latest photo and a light, grid-based archive page. Update typography to Playfair Display (journal serif), Inter (display/sans), and Crimson Pro (archive serif) and add supporting layout patterns like contact-sheet grids and negative-strip labeling.

## Alternatives considered
- Keep the existing minimalist UI and only adjust spacing.
- Apply a single theme across journal and archive pages.

## Consequences
### Positive
- The UI matches the provided design references and emphasizes the photographic narrative.
- Clear visual separation between daily journal and archive browsing.

### Negative
- Additional styling complexity and more font assets to load.

### Follow-ups
- Implement functional pagination and filtering controls for the archive.
- Consider image lazy-loading and performance tuning for large archives.
