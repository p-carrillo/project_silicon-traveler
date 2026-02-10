---
name: seo-audit
description: "Coordinate a consistent SEO audit for apps/web by running specialized SEO subagents and consolidating their findings into a single report."
---

# SEO Audit (Coordinator)

## Overview

This skill standardizes how to run and consolidate SEO audits for `apps/web/` (Next.js App Router) using the project's SEO and frontend standards.

Use it when:
- Running `/review-seo`
- Reviewing SEO-related changes in `apps/web/` as part of a broader review
- You want consistent categories, severity, and a single actionable output

## Inputs

- Scope: a list of files/folders under `apps/web/` (or `apps/web/` as a whole)
- Optional: targeted routes/pages to focus on (e.g., `apps/web/src/app/photo/[id]/`)

## Step 1: Load project context (required)

Read and apply:
- `.ai/skills/project-foundations/SKILL.md`
- `.ai/standards/frontend.md`
- `.ai/standards/seo.md`
- `.ai/standards/coding.md`

## Step 2: Normalize the scope

- Prefer auditing changed files first (staged diff if present).
- Always include SEO-critical routing files if they exist:
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/app/robots.ts`
  - `apps/web/src/app/sitemap.ts`
  - `apps/web/src/app/**/page.tsx`
  - `apps/web/src/app/**/layout.tsx`

If the audit is route-focused, expand the scope to include the route segment layout and shared components used above the fold.

## Step 3: Run SEO subagents (specialized)

Run these custom subagents (two batches, max 4 concurrent). Provide each subagent:
- The scope file list
- A short summary of the key rules from `.ai/standards/seo.md` and `.ai/standards/frontend.md`
- An instruction to follow its own criteria file in `.ai/agents/`

Batch 1:
1. `review-seo-technical` (crawl/index, robots/sitemap, indexing directives, not-found, URL hygiene)
2. `review-seo-canonicals` (canonicalization, duplicates consolidation, locale signals)
3. `review-seo-metadata` (unique title/description, Open Graph, Twitter Cards)
4. `review-seo-structured-data` (JSON-LD / Schema.org presence and correctness)

Batch 2:
5. `review-seo-web-vitals` (code-level LCP/INP/CLS risks)
6. `review-seo-a11y` (semantic HTML + accessibility issues that impact SEO/UX)

## Step 4: Consolidate findings (single report)

Create a single report and:
- Deduplicate overlapping findings across subagents.
- Keep the most actionable phrasing and include file:line evidence.
- Convert vague recommendations into concrete Next.js changes (e.g., `generateMetadata`, `metadata.alternates`, `next/image` dimensions/priority, `app/sitemap.ts` entries).

Use this template:

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
[Grouped by category]

### Medium Findings
[Grouped by category]

### Low Findings
[Grouped by category]

### Action Items
1. [Priority] Description - File:Line
2. ...
```

## Severity guide

- HIGH: likely blocks indexing/crawling, missing metadata on public pages, or significant CWV/a11y regression risk.
- MEDIUM: clear SEO degradation or duplication risk.
- LOW: optimizations and polish.

