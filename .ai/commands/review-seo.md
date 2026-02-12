# Review SEO

Perform a focused SEO audit of the Next.js web application using parallel subagents specialized in different SEO areas.

## Step 1: Determine audit scope

Identify the files to review:

1. If the user provided specific files or folders as input after the command, use those.
2. If no input was provided, run `git diff --staged --name-only` and keep only paths under `apps/web/`.
3. If there are no staged `apps/web/` changes, default scope to `apps/web/`.

If the final scope contains no `apps/web/` paths, stop and ask the user which `apps/web/` pages/components to audit.

Keep the final file list for use in subagent prompts. Filter out non-code files unless they affect SEO (e.g., `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts`, `apps/web/src/app/**/layout.tsx`).

## Step 2: Load project context

Read the coordinator skill at `.ai/skills/seo-audit/SKILL.md` and follow it.

It includes the required project context reads (`project-foundations`, `frontend`, `seo`, `coding`) and the consolidation template used by this command.

## Step 3: Launch SEO subagents in parallel

Launch the following custom SEO subagents in two batches (maximum 4 concurrent). Pass each subagent:

- The file list (scope).
- A short summary of the SEO + Frontend standards (repo-specific rules; see `.ai/standards/seo.md` and `.ai/standards/frontend.md`).
- Instructions to report findings with file/line evidence and clear fixes.
- An instruction to read its full criteria from the corresponding `.ai/agents/review-seo-*.md` file.

### Batch 1 (launch simultaneously)

1. **review-seo-technical**
   - Verify `app/robots.ts`, `app/sitemap.ts`, correct indexing directives, and crawl-safe URL patterns.
   - Check for missing `404`/`not-found.tsx` handling and accidental `noindex`/`disallow` on public routes.
2. **review-seo-canonicals**
   - Check `metadata.alternates.canonical`, `alternates.languages`/`hreflang` usage (if applicable), and duplication risks from query params.
   - Flag inconsistent canonicalization or missing canonical on duplicate-prone routes.
3. **review-seo-metadata**
   - Ensure every public page has unique `title` and `description` (per `.ai/standards/seo.md`).
   - Verify Open Graph and Twitter Card coverage; OG images meet the 1200x630 guidance and have alt where applicable.
4. **review-seo-structured-data**
   - Verify key pages include appropriate JSON-LD (homepage, photo detail, archive, map) and that it matches visible content.
   - Flag invalid/contradictory markup patterns and missing required fields.

### Batch 2 (launch after batch 1 completes)

5. **review-seo-web-vitals**
   - Identify likely LCP/INP/CLS issues from code patterns (images, layout shifts, client bundle bloat, render-blocking).
   - Validate `next/image` usage (dimensions, `priority` for LCP, `sizes`) and client boundary placement (`"use client"`).
6. **review-seo-a11y**
   - Audit semantic landmarks (`<main>`, `<nav>`, `<article>`), heading structure (one `<h1>`), focus states, and label/ARIA gaps.
   - Include image `alt` quality and any a11y issues that affect SEO/UX.

## Step 4: Consolidate results

Merge subagent findings into a single report using this template:

```text
## SEO Audit Report

### Scope
- Files reviewed: [file list]
- Review date: [current date]

### Summary
| Category                 | High | Medium | Low |
|--------------------------|------|--------|-----|
| Crawl/Index + Technical  |      |        |     |
| Canonicals + URL/Locale  |      |        |     |
| Metadata + Social Cards  |      |        |     |
| Structured Data          |      |        |     |
| Core Web Vitals Risks    |      |        |     |
| Semantics + Accessibility|      |        |     |
| **Total**                |      |        |     |

### High Findings
[Group by category; include file:line evidence and exact fix]

### Medium Findings
[...]

### Low Findings
[...]

### Action Items
1. [Priority] Description - File:Line
2. ...
```

## Step 5: Present results

Present the consolidated report to the user. If no issues were found, explicitly state that each category had no findings.
