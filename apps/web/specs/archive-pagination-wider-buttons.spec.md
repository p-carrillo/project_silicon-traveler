# Spec: Archive Pagination Wider Buttons

## Context
The "Anterior" / "Siguiente" pagination buttons on the archive page use `w-12` (48px). In Spanish, the text overflows or looks cramped. The buttons need to be wider to accommodate longer labels.

## Acceptance Criteria
- GIVEN the archive page has more than one page of results WHEN the pagination renders THEN the prev/next buttons use `w-20` (80px) width instead of `w-12`.
- GIVEN the pagination renders WHEN viewing in any locale THEN page number buttons remain at `w-12` width (unchanged).
- GIVEN the prev/next buttons are wider WHEN the button is disabled (gray) THEN it also uses `w-20` width for consistency.

## Affected Files
- `apps/web/src/app/archive/page.tsx` -- 4 occurrences of prev/next button widths (active link + disabled div, for both prev and next).

## Notes
- Only the prev/next buttons change width. Page number buttons (`01`, `02`, `...`) and ellipsis containers keep `w-12`.
