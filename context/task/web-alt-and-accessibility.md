# Web accessibility and alternative text

- **Monotask ID:** `6216351f-28f5-42e2-81ea-ae035cf5543e`
- **Priority:** High
- **Status:** To do — definition synchronized
- **Category:** General

## Source description

La web va sin accesibilidad, y eso es importante.

## Outcome

Public pages and Admin can be completed with keyboard and assistive technology, and published photographs have useful, location-aware alternative text. The target is WCAG 2.2 AA for the flows under our control.

## Scope

- Audit and fix the home/photo journal, archive/search, map, cookie banner, navigation, and Admin sign-in and route-point editing flows.
- Establish one descriptive-alt-text rule for photos using the available title, place and visible/editorial subject; decorative imagery uses empty alt text.
- Correct heading hierarchy, landmarks, form labels/errors, keyboard reachability, visible focus, modal focus return, dynamic-status announcements, contrast, target size, and reduced motion.
- Give the SVG map an accessible summary, keyboard-operable zoom controls, and an equivalent list/link route to each selected photo; do not require drag interaction to access content.
- Keep all new user-facing strings in the translation catalog.

## Non-goals

- No claim of certification or remediation of third-party browser, map-data, or provider UI.
- No visual redesign unrelated to contrast, focus, responsive targets, or readable structure.

## Acceptance criteria

- Core public and Admin flows are operable using only Tab, Shift+Tab, Enter, Space and Escape, with no keyboard trap.
- Every informational `next/image` has a non-empty, contextual alternative; decorative images are explicitly `alt=""`.
- Inputs have persistent labels; validation/error text is programmatically associated; async updates are announced without stealing focus.
- Dialogs trap focus while open and restore it to their trigger on close.
- Text and controls meet WCAG AA contrast and minimum 48×48 px touch targets where practical without compromising dense desktop data tables.
- At 320, 768, 1024 and 1440 px, there is no horizontal overflow and content remains usable.

## Implementation plan

1. Create an auditable inventory of routes/components and record baseline keyboard, screen-reader and Lighthouse findings.
2. Add shared small primitives/patterns only where repetition exists: visually hidden text, focus treatment, live status, form error association, and dialog focus handling.
3. Remediate layout/navigation and cookie consent, then photo cards/detail, then map, then Admin forms and destructive-action dialog.
4. Derive photo alt text server-side from the typed photo model and pass it explicitly to image components.
5. Add route-level loading/error semantics and verify responsive layouts and motion preferences.

## Test plan

- Add focused component tests for alt-text selection, labels, ARIA associations, focus return and map controls.
- Add source-level regression tests for all `next/image` uses where rendering test infrastructure is insufficient.
- Manually test the listed flows with keyboard and a screen reader; run Lighthouse accessibility audits on representative public pages.
- Run the web Vitest suite and lint inside Docker.

## Risks and decisions resolved

- The map is a complex visualisation: accessible controls and an equivalent selected-item path take precedence over pretending the SVG itself is a conventional map widget.
- Generated photo alt text describes the published editorial image and location; it must not assert unverified visual details from a prompt.
