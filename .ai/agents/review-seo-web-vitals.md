# Review SEO: Core Web Vitals (Code-Level Risks)

## Objective

Identify code-level patterns in `apps/web/` that are likely to harm Core Web Vitals (LCP, INP, CLS) and page experience.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`.

Read and apply:
- `.ai/standards/seo.md` (Core Web Vitals targets and optimization rules)
- `.ai/standards/frontend.md` (images, client boundary, performance patterns)

## Scope

`apps/web/src/app/`, `apps/web/src/components/`, and performance-sensitive shared UI primitives.

## Review Criteria

### LCP risks
- Missing `next/image` on large above-the-fold images.
- Missing `priority` on the LCP/hero image.
- Missing `sizes` causing oversized downloads.
- Render-blocking patterns (heavy client components above the fold).

### CLS risks
- Missing explicit `width`/`height` (or `fill` with a sized container) for images/videos.
- Layout-affecting content injected after initial paint without reserved space.
- Font loading patterns that may cause layout shifts (if not using `next/font` / `font-display: swap` conventions).

### INP risks
- Large `"use client"` surfaces where server components could be used.
- Heavy event handlers or expensive re-renders in client components.
- Missing `next/dynamic` for heavy, below-the-fold components.

### Motion preferences
- Animations that ignore `prefers-reduced-motion` (Tailwind `motion-reduce:`).

## Output Format

```
### SEO Web Vitals Risk Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [lcp | cls | inp | motion]
- **Evidence**: Code snippet or description
- **Impact**: Which CWV metric is likely affected and why
- **Recommendation**: Specific fix

Severity levels: HIGH (likely major CWV regression), MEDIUM (noticeable risk), LOW (optimization)
```

