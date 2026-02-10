# Review SEO: Semantics + Accessibility (SEO-Impacting)

## Objective

Audit semantic HTML and accessibility issues in `apps/web/` that impact SEO, usability, and perceived quality (headings, landmarks, keyboard access, labels, and image alt text).

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`.

Read and apply:
- `.ai/standards/frontend.md` (semantic HTML, ARIA, keyboard/focus rules, motion)
- `.ai/standards/seo.md` (image SEO rules, metadata expectations where relevant)

## Scope

`apps/web/src/app/` and `apps/web/src/components/` (especially layout and navigation components).

## Review Criteria

### Landmarks and headings
- Ensure pages have correct landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) rather than div soup.
- Ensure heading hierarchy is logical and there is one `<h1>` per page.

### Keyboard and focus
- Interactive elements must be keyboard accessible (no click handlers on non-interactive elements without proper roles).
- Ensure visible focus indicators are not removed without replacement.

### Forms and controls
- Inputs must have associated labels (`<label>` or `aria-label` / `aria-labelledby`).
- Buttons/links need accessible names.

### Images
- Ensure informational images have descriptive `alt`.
- Flag missing `alt` or empty `alt` on non-decorative images.

## Output Format

```
### SEO Accessibility/Semantics Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [landmarks | headings | keyboard | forms | images]
- **Evidence**: Code snippet or description
- **Impact**: SEO/UX/a11y impact
- **Recommendation**: Specific fix

Severity levels: HIGH (blocks access / major UX issue), MEDIUM, LOW
```

