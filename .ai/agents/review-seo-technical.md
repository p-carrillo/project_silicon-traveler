# Review SEO: Technical (Crawl/Index)

## Objective

Audit `apps/web/` for technical SEO issues that affect crawling, indexing, and URL discoverability (robots, sitemap, indexing directives, 404 handling, and crawl traps).

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

Read and apply:
- `.ai/standards/seo.md` (sitemap/robots rules, rendering strategy, URL structure)
- `.ai/standards/frontend.md` (App Router conventions)

## Scope

Primarily `apps/web/src/app/` and any supporting SEO utilities used by routing and metadata.

## Review Criteria

### robots.txt (Next.js `app/robots.ts`)
- Ensure `app/robots.ts` exists and blocks non-public paths (at minimum `/api/`) while allowing public routes.
- Ensure `robots.ts` references the sitemap URL (`sitemap: .../sitemap.xml`).
- Flag disallow rules that would block public pages or key assets.

### sitemap.xml (Next.js `app/sitemap.ts`)
- Ensure `app/sitemap.ts` exists and includes all public, indexable pages (homepage, archive, map, photo detail pages).
- Ensure dynamic content is reflected (sitemap generation pulls published items).
- Flag missing `lastModified` / stale update behavior where the repo expects it.

### Indexing directives
- Look for accidental `noindex`/`nofollow` in metadata (`robots` in Next.js metadata) on public routes.
- Flag patterns that generate multiple URL variants without canonicalization (e.g., query-param driven pages) that would create crawl duplication.

### 404 / Not Found handling
- Check for `not-found.tsx` and/or proper not-found patterns in route segments.
- Flag routes that return success UI while actually representing missing content (soft 404 risk).

### URL hygiene and crawl traps
- Flag unbounded pagination, infinite scroll without server-side pagination, or parameter combinations that can explode URL space.
- Flag routes that create indexable pages for internal-only states (e.g., debug pages).

## Output Format

Return findings using this structure:

```
### SEO Technical Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [robots | sitemap | indexing-directives | not-found | url-hygiene]
- **Evidence**: Code snippet or description
- **Impact**: How this affects crawling/indexing
- **Recommendation**: Specific fix

Severity levels: HIGH (blocks indexing/crawling), MEDIUM (creates duplication or discoverability gaps), LOW (optimization)
```

If you find no issues, explicitly say "No issues found" for each category.

