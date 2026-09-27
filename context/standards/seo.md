# Standard: SEO

## Objective
Ensure every user-facing page is optimally crawlable, indexed, and presented in search results, with strong Core Web Vitals and structured data.

## Scope
- Metadata (title, description, Open Graph, Twitter Cards).
- Structured data (JSON-LD / Schema.org).
- Sitemap and robots.txt.
- Core Web Vitals (LCP, INP, CLS).
- Crawlability, indexing, and URL structure.
- Image SEO.
- Internationalization and locale signals.

---

## Metadata

### Next.js Metadata API
Use the App Router Metadata API — either a static `metadata` export or a dynamic `generateMetadata` function per route.

```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'Archive — Silicon Traveler',
  description: 'Browse the photo archive of the Silicon Traveler journey.',
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const photo = await getPhoto(params.date);
  return {
    title: `${photo.title} — Silicon Traveler`,
    description: photo.description,
    openGraph: {
      title: photo.title,
      description: photo.description,
      images: [{ url: photo.imageUrl, width: 1200, height: 630, alt: photo.title }],
      type: 'article',
      locale: photo.lang === 'es' ? 'es_ES' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: photo.title,
      description: photo.description,
      images: [photo.imageUrl],
    },
  };
}
```

### Rules
- Every page MUST have a unique `title` and `description`.
- Title format: `<Page Title> — Silicon Traveler` (use template in root layout).
- Description: 50–160 characters, descriptive and unique per page.
- Include Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:locale`) on all public pages.
- Include Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
- OG images should be at least 1200×630px.

---

## Structured data (JSON-LD)

Add Schema.org structured data to key pages to enable rich results.

```typescript
// In a Server Component
export default function PhotoPage({ photo }: { photo: Photo }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    name: photo.title,
    description: photo.description,
    image: photo.imageUrl,
    datePublished: photo.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Silicon Traveler',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

### Recommended schemas
| Page | Schema type |
|------|------------|
| Homepage | `WebSite` with `SearchAction` (if search exists) |
| Photo detail | `Photograph` or `ImageObject` |
| Archive | `CollectionPage` with `ItemList` |
| Map | `WebPage` |

### Rules
- Validate structured data with [Google Rich Results Test](https://search.google.com/test/rich-results).
- Keep JSON-LD in sync with visible page content.
- Do not include structured data that contradicts what the user sees.

---

## Sitemap and robots.txt

### Sitemap
Create a dynamic sitemap using the Next.js file convention:

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photos = await getAllPublishedPhotos();
  const photoEntries = photos.map((photo) => ({
    url: `https://example.com/photo/${photo.dateSlug}`,
    lastModified: photo.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://example.com/archive', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://example.com/map', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...photoEntries,
  ];
}
```

### robots.txt
Create via file convention:

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

### Rules
- Sitemap MUST include all public, indexable pages.
- Update sitemap automatically when content changes (dynamic generation preferred).
- Block `/api/` routes and internal paths in robots.txt.
- Submit sitemap to Google Search Console.

---

## Core Web Vitals

Three metrics that directly impact search ranking:

| Metric | Target | What it measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Loading performance — time until the largest visible element renders. |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Interactivity — responsiveness to user input. |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Visual stability — unexpected layout shifts. |

### LCP optimization
- Identify the LCP element per page (usually a hero image or heading).
- Use `next/image` with `priority` on the LCP image.
- Preload critical resources (fonts, above-the-fold images).
- Minimize server response time (efficient data fetching, caching).
- Use Server Components to reduce client-side rendering time.

### INP optimization
- Keep event handlers fast — avoid long synchronous tasks.
- Offload heavy computation to Server Components or Web Workers.
- Use `React.startTransition` for non-urgent state updates.
- Lazy-load non-critical JavaScript with `next/dynamic`.
- Minimize client-side JavaScript bundle size.

### CLS optimization
- Set explicit `width` and `height` on all images and videos.
- Reserve space for dynamically loaded content (skeletons, fixed-height containers).
- Avoid injecting content above existing visible elements.
- Use `font-display: swap` and preload fonts to prevent FOIT/FOUT shifts.

### Monitoring
- Test with Lighthouse in production builds (`next build && next start`).
- Use Chrome DevTools Performance panel for INP debugging.
- Monitor real-user metrics via Vercel Analytics or web-vitals library.

---

## Image SEO

- Every informational image MUST have descriptive `alt` text.
- Use `alt=""` only for purely decorative images.
- Include relevant keywords naturally in `alt` text — do not keyword-stuff.
- Serve images in modern formats (WebP, AVIF) when possible.
- Use responsive images (`sizes` attribute with `next/image`).
- Name image files descriptively (`valencia-sunset.jpg`, not `IMG_4532.jpg`).

---

## URL structure

- Use clean, descriptive, lowercase URLs (`/photo/2026-02-01`, not `/photo?id=42`).
- Use hyphens to separate words (`/photo/coastal-road`, not `/photo/coastal_road`).
- Keep URLs stable — avoid changing published URLs without redirects.
- Implement canonical URLs for pages with query parameters or duplicate content.

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/archive',
  },
};
```

---

## Internationalization (SEO)

- Set the `lang` attribute on `<html>` to the detected locale.
- Use `hreflang` link tags or metadata alternates for multi-language content.
- Provide locale-specific Open Graph `og:locale` tags.
- Include localized content in titles and descriptions.

```typescript
export const metadata: Metadata = {
  alternates: {
    languages: {
      'en': 'https://example.com/en/archive',
      'es': 'https://example.com/es/archive',
    },
  },
};
```

---

## Rendering strategy for SEO

- **Server-side rendering (SSR)** is the default with Next.js App Router — search engines receive fully rendered HTML.
- Avoid `export const dynamic = 'force-dynamic'` on pages that could be statically generated.
- Use `generateStaticParams` for pages with a known set of slugs (e.g. photo detail pages).
- Prefer static generation (SSG) for content that doesn't change per request.
- Use Incremental Static Regeneration (ISR) with `revalidate` for content that changes periodically.

---

## Checklist
- [ ] Every page has a unique `title` and `description`.
- [ ] Open Graph and Twitter Card tags are set on all public pages.
- [ ] OG images are at least 1200×630px.
- [ ] JSON-LD structured data is added to key pages and validated.
- [ ] `sitemap.ts` generates entries for all public pages.
- [ ] `robots.ts` blocks non-public paths and references the sitemap.
- [ ] LCP image uses `next/image` with `priority`.
- [ ] All images have explicit dimensions (`width`/`height` or `fill`).
- [ ] No layout shifts from dynamically loaded content (CLS ≤ 0.1).
- [ ] Client JS bundle is minimized; heavy components are lazy-loaded.
- [ ] All images have descriptive `alt` text.
- [ ] URLs are clean, lowercase, and stable.
- [ ] Canonical URLs are set where needed.
- [ ] `lang` attribute is set on `<html>`.
- [ ] Rendering strategy is chosen per route (SSG > ISR > SSR).
