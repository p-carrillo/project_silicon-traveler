# Standard: Frontend

## Objective
Define consistent patterns for building the Next.js + React frontend with performance, accessibility, and maintainability as first-class concerns.

## Scope
- Next.js App Router conventions (Server vs Client Components).
- Component structure, typing, and composition.
- Data fetching and state management.
- Performance (images, fonts, bundle size, streaming).
- Accessibility (semantic HTML, ARIA, focus management, motion).
- Styling with Tailwind CSS.
- Error and loading states.
- Internationalization (i18n).

## Tech stack reference
- **Framework**: Next.js 14 (App Router)
- **UI library**: React 18
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript 5 (strict mode)
- **State**: React hooks only (no external state library)
- **i18n**: Server-side locale detection + translation files

---

## Server vs Client Components

### Default to Server Components
All components are Server Components unless explicitly marked with `"use client"`. Keep as much as possible on the server.

**Use Server Components when:**
- Fetching data (database, API, file system).
- Accessing server-only resources (env vars, API keys).
- Rendering static or cacheable content.
- Keeping heavy libraries out of the client bundle.

**Use `"use client"` only when:**
- You need browser APIs (`window`, `localStorage`, `navigator`).
- You need React hooks (`useState`, `useEffect`, `useRef`).
- You need event handlers (`onClick`, `onChange`, `onSubmit`).
- You need third-party client-only libraries.

### Boundary rules
- Place the `"use client"` directive at the top of the file, above all imports.
- Push the client boundary as far down the tree as possible — wrap only the interactive piece, not the whole page.
- Props passed from Server to Client Components must be serializable (no functions, classes, or Dates).

### Pattern: Server wrapper + Client island
```typescript
// app/map/page.tsx (Server Component — fetches data)
import { getMapState, getMapPins } from '@/lib/api';
import { MapExplorer } from '@/components/map/MapExplorer';

export default async function MapPage() {
  const state = await getMapState();
  const pins = await getMapPins(state.bbox);
  return <MapExplorer initialState={state} initialPins={pins} />;
}
```

---

## Component structure

### Organization
```
apps/web/src/
  components/
    layout/          # Shell components (PageContainer, TopBar)
    map/             # Map-related components
    photo/           # Photo-related components
    ui/              # Reusable UI primitives (Button, Modal, Input)
  app/               # Routes and pages (App Router)
  lib/               # Utilities, API client, i18n, helpers
  types/             # Shared TypeScript types
```

### Naming
- Component files: `PascalCase.tsx` (e.g. `MapExplorer.tsx`).
- Utility/hook files: `camelCase.ts` (e.g. `useMapViewport.ts`).
- One component per file. Co-locate small helper components only if they are tightly coupled.

### Typing
- Type all props with an explicit interface or type alias — never `any`.
- Export prop types when consumers need them.
- Use `React.ComponentPropsWithoutRef<'element'>` for components wrapping native elements.

```typescript
interface PhotoCardProps {
  photo: Photo;
  priority?: boolean;
  onSelect?: (id: string) => void;
}

export function PhotoCard({ photo, priority = false, onSelect }: PhotoCardProps) { ... }
```

---

## Data fetching

### Server-side (preferred)
- Use `async` Server Components to fetch data before render.
- Fetch from the internal API (`http://api:3000`) on the server.
- Use `cache: 'no-store'` for dynamic data or Next.js revalidation for semi-static data.

### Client-side (when needed)
- Fetch through Next.js API proxy routes (`/api/*`) — never expose the internal API or API keys to the browser.
- Use `useEffect` + `useState` for client fetches, with proper loading and error states.
- Avoid waterfalls: fetch in parallel when possible (`Promise.all`).

---

## Performance

### Images
- Use `next/image` for all images.
- Set `priority` on above-the-fold hero/LCP images.
- Always provide explicit `width` and `height` (or `fill` with a sized container) to prevent CLS.
- Use `alt` text on every image (see Accessibility below).

### Fonts
- Load fonts via `next/font` or CSS `@font-face` with `font-display: swap`.
- Preload critical font files.
- Limit font weight/style variants to what is actually used.

### Bundle size
- Keep `"use client"` boundary small — don't pull large libraries into client bundles.
- Use dynamic imports (`next/dynamic`) for heavy or below-the-fold components.
- Review bundle impact with `@next/bundle-analyzer` when adding dependencies.

### Streaming and Suspense
- Use `loading.tsx` files for route-level loading states.
- Wrap slow async sections in `<Suspense fallback={...}>` to stream partial content.
- Place Suspense boundaries at meaningful UX breakpoints (above-the-fold vs. below-the-fold).

---

## Accessibility

### Semantic HTML
- Use correct elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<button>`, `<a>`.
- Use headings (`h1`–`h6`) in logical order — one `<h1>` per page.
- Use `<ul>`/`<ol>` for lists, `<table>` for tabular data.

### ARIA
- Prefer native semantics over ARIA (`<button>` over `<div role="button">`).
- Use `aria-label` or `aria-labelledby` for elements without visible text.
- Use `aria-live="polite"` for dynamic content updates (toasts, loaders).
- Use `aria-describedby` to link inputs with help/error text.

### Keyboard and focus
- All interactive elements must be reachable via Tab.
- Provide visible focus indicators — use Tailwind's `focus:ring-2 focus:ring-offset-2` utilities.
- Manage focus in modals (trap focus, return focus on close).
- Never remove `outline` without providing an alternative indicator.

### Motion and preferences
- Respect `prefers-reduced-motion`: use Tailwind `motion-reduce:` variants for animations.
- Respect `prefers-color-scheme` when implementing dark mode via Tailwind `dark:` prefix.

### Screen readers
- Use Tailwind `sr-only` class for visually hidden but accessible text.
- Provide meaningful `alt` text for informational images; use `alt=""` for decorative images.
- Announce route changes and dynamic content to assistive technologies.

### Color contrast
- Maintain WCAG AA minimum contrast (4.5:1 for normal text, 3:1 for large text).
- Test with browser DevTools accessibility audit or Lighthouse.

---

## Styling with Tailwind

### Conventions
- Use Tailwind utility classes directly in JSX — avoid custom CSS unless strictly necessary.
- Extract repeated patterns into components, not into `@apply` blocks.
- Use `globals.css` only for base styles, font definitions, and truly global utilities.

### Responsive design (mobile-first)
- **Mobile-first always**: write base styles for the smallest screen, then layer up with `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- Test layouts at common breakpoints: 320px, 375px, 768px, 1024px, 1440px.
- Touch targets: interactive elements must be at least **48×48px** on mobile (Apple/Google HIG guideline).
- Use spacing and padding generously on small screens — thumbs need room.
- Ensure the viewport meta tag is set: `<meta name="viewport" content="width=device-width, initial-scale=1" />` (Next.js sets this by default in the App Router).
- Avoid horizontal scroll — nothing should overflow the viewport width.

### Responsive typography
- Use fluid typography with `clamp()` for headings to scale smoothly across screen sizes:
  ```css
  font-size: clamp(1.5rem, 4vw, 3rem);
  ```
- Or use Tailwind responsive prefixes: `text-xl md:text-2xl lg:text-4xl`.
- Ensure body text is at least **16px** on mobile to prevent iOS zoom on input focus.

### Responsive images
- Use the `sizes` attribute with `next/image` so the browser downloads the right size:
  ```tsx
  <Image src={photo.url} alt={photo.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
  ```
- For art direction (different crops per breakpoint), use `<picture>` with `<source>` elements.
- Never serve desktop-sized images to mobile — bandwidth and LCP matter.

### Responsive layout patterns
- Use CSS Grid and Flexbox for layouts — avoid fixed widths.
- Prefer `gap` over margin for spacing between grid/flex items.
- Stack columns vertically on mobile, go multi-column on larger screens:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  ```
- Hide non-essential elements on small screens with `hidden md:block` — but ensure key content remains accessible.

### Dark mode
- Use Tailwind `dark:` variant tied to `class` strategy.
- Provide sufficient contrast in both light and dark themes.

---

## Error and loading states

- Implement `error.tsx` boundary files for graceful error handling per route.
- Implement `loading.tsx` for route transition loading states.
- Show meaningful error messages and retry options — never blank screens.
- Use skeleton loaders or spinners consistently.

---

## Internationalization

- Detect locale server-side via `Accept-Language` header.
- Use translation keys — never hardcode UI text.
- Set the `lang` attribute on `<html>` dynamically.
- Keep translation files in `src/lib/i18n/translations.ts` (or split per locale).

---

## Checklist
- [ ] Server Components are the default; `"use client"` is used only where needed.
- [ ] Client boundary is pushed as far down the tree as possible.
- [ ] All props are explicitly typed — no `any`.
- [ ] Images use `next/image` with `width`/`height` and `alt`.
- [ ] Above-the-fold images have `priority`.
- [ ] Dynamic imports used for heavy/below-the-fold components.
- [ ] Semantic HTML elements are used correctly.
- [ ] All interactive elements are keyboard-accessible with visible focus.
- [ ] `prefers-reduced-motion` is respected for animations.
- [ ] Color contrast meets WCAG AA.
- [ ] `loading.tsx` and `error.tsx` are present for key routes.
- [ ] Layouts are mobile-first and tested at 320px, 768px, 1024px, 1440px.
- [ ] Touch targets are at least 48×48px on mobile.
- [ ] Body text is at least 16px; headings use fluid sizing.
- [ ] Images use `sizes` attribute for responsive loading.
- [ ] No horizontal overflow at any viewport width.
- [ ] No UI text is hardcoded — translations are used.
- [ ] Data fetched server-side where possible; client fetches go through API proxy.
