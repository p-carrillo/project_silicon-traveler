# Spec: Map Photo Link to Journey

## Context
When a pin is selected on the map, the sidebar shows the photo thumbnail with metadata. Clicking the thumbnail does nothing. Users expect to navigate to the photo's journal view.

## Acceptance Criteria
- GIVEN a pin is selected on the map WHEN the user clicks the photo thumbnail THEN the browser navigates to `/photo/{YYYY-MM-DD}` where the date is extracted from `activeFrame.publishedAt`.
- GIVEN a pin is selected WHEN the sidebar renders THEN the photo image is wrapped in a clickable link element.
- GIVEN the link is rendered WHEN the date is `2026-02-01T12:00:00Z` THEN the href is `/photo/2026-02-01`.

## Affected Files
- `apps/web/src/components/map/MapExplorer.tsx` -- wrap the activeFrame image block with a Next.js Link to `/photo/{date}`.
- `apps/web/src/components/map/active-frame.ts` -- add `dateSlug` field to `ActiveFrame` type for pre-computed date.

## Notes
- Use `new Date(publishedAt).toISOString().slice(0, 10)` to extract the date slug.
- Import `Link` from `next/link` in MapExplorer (already a client component).
- Use `next/link` for client-side navigation, which works inside `"use client"` components.
