# Frontend Next.js Skill

## Purpose
Guide frontend changes in the Next.js app using standard App Router practices for a simple monorepo client that fetches data from the server.

## Scope and assumptions
- Client lives in `client/` and uses Next.js App Router.
- Server runs on port `3001` locally and is reached via `API_URL`.
- The app remains intentionally small: a single page that shows server data.

## Source of truth
- `docs/architecture/overview.md`
- `client/src/app/page.tsx`
- `docker-compose.yml`

## Standard Next.js practices for this repo
- Default to Server Components; only mark a component with `"use client"` when browser-only APIs or interactivity are required.
- Fetch server data with `fetch` from the Server Component layer.
- Keep data access in small functions (local to the page or in `client/src/lib/`), typed with explicit response shapes.
- Use environment configuration via `process.env.API_URL`; include a safe local fallback for dev.
- Avoid leaking secrets to the client; never read server-only secrets in Client Components.

## Data fetching rules
- Use `cache: "no-store"` for live server health or dynamic endpoints.
- Handle non-OK responses and network errors explicitly with clear fallback UI.
- Keep network boundaries clean: no direct database or server code imports in the client.

## Recommended file layout (keep it small)
```
client/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── components/           # Optional: small UI parts
└── lib/
    └── api.ts                # Optional: shared fetch helpers
```

## Monorepo integration
- Local dev: default to `http://localhost:3001` unless `API_URL` is set.
- Docker Compose: `API_URL` must point to `http://server:3001` as defined in `docker-compose.yml`.

## Checklist before finishing changes
- Page uses Server Components unless interactivity is necessary.
- Fetching logic handles failures and non-OK responses.
- Types for API responses are explicit and kept near the fetch code.
- UI stays minimal and matches the "It works" baseline intent.
