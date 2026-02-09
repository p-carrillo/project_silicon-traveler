# Spec: Archive Hide Filters on Mobile

## Context
On mobile screens, the DateRangeAction and Geography link in the archive page take up too much space. Only the text search bar should remain visible on mobile.

## Acceptance Criteria
- GIVEN the archive page on a mobile screen (< 768px) WHEN the page renders THEN the DateRangeAction and Geography link container is hidden.
- GIVEN the archive page on a desktop screen (>= 768px) WHEN the page renders THEN the DateRangeAction and Geography link are visible as before.
- GIVEN the archive page on mobile WHEN the page renders THEN the text SearchBar remains visible and functional.

## Affected Files
- `apps/web/src/app/archive/page.tsx` -- add `hidden md:flex` to the container wrapping DateRangeAction and the Geography link.

## Notes
- The change is a single Tailwind class addition: replace `flex` with `hidden md:flex` on the wrapper div.
- The SearchBar in the first column remains untouched.
