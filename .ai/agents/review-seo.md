# Review SEO

## Objective

Analyze the web application (`apps/web/`) for SEO, web performance, and accessibility issues that impact search engine visibility and user experience.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

## Scope

This review focuses primarily on `apps/web/` (Next.js frontend). Other apps and packages are only relevant when they affect web-facing output (e.g., API responses that feed metadata).

## Review Criteria

### Meta Tags and Head Management
- Missing or generic `<title>` tags per page.
- Missing or empty `<meta name="description">` tags.
- Missing canonical URLs (`<link rel="canonical">`).
- Missing or incorrect `<meta name="robots">` directives.
- Missing language attributes (`<html lang="en">`).

### Open Graph and Social Sharing
- Missing Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`).
- Missing Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:image`).
- OG images with incorrect dimensions or missing alt text.

### Structured Data
- Missing JSON-LD structured data for key content (photos, articles, breadcrumbs).
- Invalid or incomplete schema.org markup.
- Structured data that does not match visible page content.

### Semantic HTML
- Heading hierarchy issues (skipping levels, multiple `<h1>` tags).
- Non-semantic elements where semantic HTML should be used (`<div>` instead of `<nav>`, `<main>`, `<article>`, `<section>`).
- Missing landmark roles.

### Images
- Missing `alt` attributes on `<img>` elements.
- Missing `width` and `height` attributes (causes layout shift).
- Unoptimized images not using Next.js `<Image>` component.
- Missing lazy loading for below-the-fold images.

### Core Web Vitals Concerns
- Large Contentful Paint (LCP): oversized images, render-blocking resources.
- Cumulative Layout Shift (CLS): missing dimensions, dynamic content injection.
- Interaction to Next Paint (INP): heavy event handlers, unoptimized re-renders.

### SSR/SSG Patterns
- Pages that should be statically generated but use client-side rendering.
- Missing `getStaticProps` / `getServerSideProps` where appropriate.
- Client-only content that search engines cannot index.

### Accessibility (a11y)
- Missing ARIA labels on interactive elements.
- Insufficient color contrast.
- Missing focus management for keyboard navigation.
- Form inputs without associated labels.

### Technical SEO
- Missing `robots.txt` configuration.
- Missing `sitemap.xml` generation.
- Missing 404 page handling.
- URLs with unnecessary query parameters or hash fragments.

## Output Format

Return findings using this structure:

```
### SEO Review Findings

#### [SEVERITY] Title
- **File**: path/to/file.tsx:LINE
- **Category**: [meta-tags | open-graph | structured-data | semantic-html | images | web-vitals | ssr-ssg | a11y | technical-seo]
- **Evidence**: Code snippet or description
- **Impact**: How this affects SEO ranking, user experience, or accessibility
- **Recommendation**: Specific fix

Severity levels: HIGH (blocks indexing or severely impacts ranking), MEDIUM (degrades SEO performance or accessibility), LOW (optimization opportunity)
```
