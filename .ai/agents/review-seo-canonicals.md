# Review SEO: Canonicals + Locale Signals

## Objective

Audit canonicalization, duplicate URL consolidation, and locale signaling for `apps/web/` routes (canonicals, alternates, and language/locale metadata patterns).

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`.

Read and apply:
- `.ai/standards/seo.md` (canonical URLs, i18n signals, URL structure rules)
- `.ai/standards/frontend.md` (App Router metadata conventions)

## Scope

`apps/web/src/app/**/{layout,page}.tsx`, route segments, and any metadata helpers used across pages.

## Review Criteria

### Canonical URLs
- Ensure public pages define canonical URLs via `metadata.alternates.canonical` where duplicate risk exists (filters, query params, pagination).
- Flag canonicals that point to non-canonical variants (e.g., including transient query params).
- Flag inconsistent canonical base (http vs https, trailing slash inconsistency, locale prefix inconsistency).

### Language alternates / hreflang
- If the app is localized, verify `metadata.alternates.languages` is used consistently for public routes.
- Verify `<html lang>` is set correctly (usually via root layout), matching locale detection strategy.
- Flag mixed-locale metadata (e.g., Spanish content with `en_US` Open Graph locale, or wrong language alternates).

### Duplicate content patterns
- Flag multiple routes rendering materially identical content without canonical consolidation.
- Flag route groups that can render the same content under different URLs.

## Output Format

```
### SEO Canonicals/Locale Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [canonical | alternates-languages | html-lang | duplicates]
- **Evidence**: Code snippet or description
- **Impact**: How this affects duplicate consolidation and international SEO
- **Recommendation**: Specific fix

Severity levels: HIGH, MEDIUM, LOW
```

Only report issues you can point to in code (avoid hypothetical concerns without evidence).

