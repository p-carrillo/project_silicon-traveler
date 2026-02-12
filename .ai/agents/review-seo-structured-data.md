# Review SEO: Structured Data (JSON-LD)

## Objective

Audit Schema.org JSON-LD structured data in `apps/web/` to ensure key pages include appropriate markup and that the JSON-LD matches visible content.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`.

Read and apply:
- `.ai/standards/seo.md` (recommended schemas per page, rules about consistency with visible content)
- `.ai/standards/frontend.md` (Server Component usage patterns)

## Scope

`apps/web/src/app/` key pages (homepage, archive, map, photo detail) and any shared structured data helpers/components.

## Review Criteria

### Presence on key pages
- Homepage: `WebSite` (and `SearchAction` only if search exists).
- Photo detail: `Photograph` or `ImageObject`.
- Archive: `CollectionPage` with `ItemList` where appropriate.
- Map: `WebPage` (or a more specific type if present).

### Correctness + consistency
- JSON-LD must match visible content (title, description, image URL, dates).
- Flag structured data that references missing/undefined fields or uses placeholders.
- Flag schema types that do not match the page intent.

### Implementation quality
- Prefer JSON-LD in Server Components.
- Ensure `dangerouslySetInnerHTML` is used only for the JSON-LD script and the JSON is generated from trusted data.

## Output Format

```
### SEO Structured Data Review Findings

#### [SEVERITY] Title
- **File**: apps/web/...:LINE
- **Category**: [missing-jsonld | invalid-shape | content-mismatch | schema-type]
- **Evidence**: Code snippet or description
- **Impact**: Rich result eligibility / trust / snippet enhancements
- **Recommendation**: Specific fix

Severity levels: HIGH, MEDIUM, LOW
```

