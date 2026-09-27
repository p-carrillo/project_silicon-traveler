# Spec: Map Fullscreen on Mobile

## Context
On mobile screens, the map is barely visible because the search bar and sidebar take up too much space. The map should occupy most of the screen on mobile.

## Acceptance Criteria
- GIVEN the map page on a mobile screen WHEN the page renders THEN the search input in the map header bar is hidden (only zoom buttons remain visible).
- GIVEN the map page on a desktop screen WHEN the page renders THEN the search input remains visible.
- GIVEN the map page on mobile WHEN the page renders THEN the map area occupies a larger height (`min-h-[70vh]` instead of capped at `max-h-[70vh]`).
- GIVEN the map page on mobile WHEN the page renders THEN the PageContainer has reduced padding.
- GIVEN the map page on mobile WHEN the page renders THEN the sidebar stacks below the map (single column layout).

## Affected Files
- `apps/web/src/app/map/page.tsx` -- reduce padding on mobile for the PageContainer.
- `apps/web/src/components/map/MapExplorer.tsx`:
  - Hide the search input on mobile with `hidden md:flex`.
  - Adjust the map container height for mobile.
  - Keep the grid as single-column on mobile (already is via `grid-cols-1 lg:grid-cols-[...]`).

## Notes
- Use Tailwind responsive classes consistently.
- The sidebar info panel already stacks below on mobile due to `grid-cols-1`.
- Keep zoom buttons visible on all screen sizes.
