# Review SEO: Metadata + Social Cards

## Objective

Audit page metadata and social sharing tags for `apps/web/` using the repo's SEO standards (unique title/description, Open Graph, Twitter Cards, and OG image constraints).

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`.

Read and apply:
- `.ai/standards/seo.md` (Next.js Metadata API rules, title format, OG/Twitter requirements)
- `.ai/standards/frontend.md` (App Router metadata patterns)

## Scope

Public pages under `apps/web/src/app/` including `layout.tsx`, route `page.tsx`, and any `generateMetadata` functions.

## Review Criteria

### Title + Description
- Every public page must have a unique `title` and `description`.
- Titles should follow the repo format: `<Page Title> — Silicon Traveler` (using the root layout template where applicable).
- Flag generic/duplicated metadata across multiple routes.

### Open Graph
- Ensure Open Graph metadata is present for public pages (`title`, `description`, `images`, `type`, `locale` when applicable).
- Check OG images follow the repo guidance (at least 1200x630 where applicable).
- Flag missing OG image `alt` when the code supports it.

### Twitter Cards
- Ensure `twitter.card` and related fields are set for public pages.
- Flag inconsistent Twitter/OG titles/descriptions that would generate confusing previews.

### Metadata completeness across route variants
- Flag routes that fetch data but forget to set metadata dynamically (e.g., photo detail pages with static metadata).
- Flag client-only pages where metadata is missing because the page is incorrectly marked `"use client"`.

## Output Format

```
### SEO Metadata Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [title-description | open-graph | twitter | dynamic-metadata]
- **Evidence**: Code snippet or description
- **Impact**: How this affects SERP snippet quality and social previews
- **Recommendation**: Specific fix

Severity levels: HIGH (missing metadata on public pages), MEDIUM (duplicated/generic), LOW (improvements)
```

