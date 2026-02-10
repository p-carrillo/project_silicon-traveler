# AGENTS

## Repository Summary
This repo is a Node.js + TypeScript monorepo with a modular hexagonal architecture and MariaDB without an ORM (direct SQL and connections). The codebase follows the most widely adopted TypeScript standard and applies SOLID.

## Project standards
Standards live in `.ai/standards/` (IDE-agnostic). They are grouped by context so agents know which to apply.

### Common standards (always apply)
- `.ai/standards/coding.md`: TypeScript conventions, SOLID, typing, and error handling.
- `.ai/standards/test.md`: Vitest strategy, test structure, patterns, and coverage goals.
- `.ai/standards/commit.md`: Conventional Commits format, types, scopes, and rules.
- `.ai/standards/subagents.md`: Patterns for using subagents effectively.

### Backend standards (apply when working on `apps/api`, `apps/cli`, `apps/scheduler`, `packages/*`)
- `.ai/standards/architecture.md`: Hexagonal architecture, layers, ports, and dependency rules.
- `.ai/standards/database.md`: MariaDB without ORM, pooling, repositories, and migrations.

### Frontend standards (apply when working on `apps/web`)
- `.ai/standards/frontend.md`: Next.js App Router, React components, accessibility, performance, and Tailwind CSS.
- `.ai/standards/seo.md`: Metadata, structured data, Core Web Vitals, sitemap, and crawlability.

### How to determine context
- **Backend context**: the change is inside `apps/api/`, `apps/cli/`, `apps/scheduler/`, or any `packages/*` module.
- **Frontend context**: the change is inside `apps/web/`.
- **Both contexts**: the change spans backend and frontend (e.g. adding an API endpoint + a page that consumes it). Apply both sets.

### Priority order
When work touches more than one standard, follow them in this order:

**Backend path:**
1) `.ai/standards/architecture.md`
2) `.ai/standards/database.md`
3) `.ai/standards/coding.md`
4) `.ai/standards/test.md`

**Frontend path:**
1) `.ai/standards/frontend.md`
2) `.ai/standards/seo.md`
3) `.ai/standards/coding.md`
4) `.ai/standards/test.md`

## Dos and Don'ts

### Do

**Common (all contexts)**
- Use `unknown` with type narrowing instead of `any`.
- Keep domain layer pure: no framework imports, no IO, no infrastructure dependencies.
- Use dependency injection: adapters receive ports via constructor.
- Integrate across modules via ports/interfaces, never by importing internals.
- Name variables and functions using business domain language.
- Write tests following AAA pattern (Arrange, Act, Assert) with Vitest.
- Use Conventional Commits: `<type>(<scope>): <subject>` (lowercase, imperative, max 72 chars).
- Run all commands inside Docker (see Execution environment below).

**Backend (`apps/api`, `apps/cli`, `apps/scheduler`, `packages/*`)**
- Use parameterized queries for ALL SQL — never concatenate user input.
- Use cases are the central orchestration unit — all business logic flows through them.
- Always release database connections in a `finally` block (`conn.release()`).
- Prefer pure functions in the domain layer.

**Frontend (`apps/web`)**
- Default to Server Components; use `"use client"` only when browser APIs or hooks are needed.
- Push the client boundary as far down the component tree as possible.
- Use `next/image` for all images, with `priority` on above-the-fold (LCP) images.
- Always provide explicit `width`/`height` on images to prevent layout shifts (CLS).
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`) — not `<div>` for everything.
- Ensure all interactive elements are keyboard-accessible with visible focus indicators.
- Respect `prefers-reduced-motion` for animations (Tailwind `motion-reduce:`).
- Fetch data server-side where possible; client fetches go through Next.js API proxy routes.
- Every public page MUST have unique metadata (title, description, Open Graph, Twitter Cards).
- Include JSON-LD structured data on key pages (photo detail, archive, homepage).

### Don't

**Common (all contexts)**
- Do NOT import from another package's internal `src/` folders — use the package entry point.
- Do NOT use `any` without explicit justification in a comment.
- Do NOT add new production dependencies without discussion.
- Do NOT skip tests — every feature or change needs unit and/or integration tests.
- Do NOT run `pnpm`, `node`, or `vitest` directly on the host machine.

**Backend (`apps/api`, `apps/cli`, `apps/scheduler`, `packages/*`)**
- Do NOT put SQL queries in route handlers — use a use case + repository.
- Do NOT use an ORM — this project uses raw SQL with MariaDB intentionally.

**Frontend (`apps/web`)**
- Do NOT hardcode UI text — use translation keys.
- Do NOT use `export const dynamic = 'force-dynamic'` on pages that could be statically generated.
- Do NOT expose internal API URLs or API keys to the browser.
- Do NOT mark entire pages as Client Components — isolate interactivity in child components.

## Good and bad examples

### Good patterns — Backend
- **Repository with proper connection management**: `packages/journey/src/adapters/mariadb-journey.repository.ts` — parameterized queries, `try/finally` with `conn.release()`, clean row-to-entity mapping via `toDomain()`.
- **Use case with SRP and DI**: `packages/journey/src/application/create-journey.use-case.ts` — single responsibility, receives repository via constructor, delegates domain logic to entity.
- **Rich domain entity**: `packages/journey/src/domain/journey.entity.ts` — behavior methods (`updatePosition`), factory method (`create`), proper encapsulation.
- **Clean port interface**: `packages/journey/src/ports/journey-repository.port.ts` — uses domain types, clear method signatures.
- **Value object with validation**: `packages/map/src/domain/bounding-box.ts` — validation in constructor, helper functions, constants, pure functions.
- **Well-structured route handler**: `apps/api/src/routes/map.routes.ts` — delegates to use cases, proper error handling, input validation via utilities.

### Good patterns — Frontend
- **Server Component with data fetching**: page components fetch data server-side and pass serializable props to Client Components (server wrapper + client island pattern).
- **Client island component**: `apps/web/src/components/map/MapExplorer.tsx` — `"use client"` only where interactive hooks are needed, proper TypeScript typing, clean separation of concerns.
- **API proxy for security**: `apps/web/src/lib/api-proxy.ts` — API key injected server-side, internal URLs never exposed to the browser.
- **Dynamic metadata per route**: `generateMetadata()` in page files with locale-aware title, description, and Open Graph tags.

### Anti-patterns to avoid
- **SQL in route handlers**: `apps/api/src/routes/journey.routes.ts` — contains direct SQL queries that bypass use cases and the domain layer. New routes MUST delegate to use cases.
- **Placeholder implementations**: `packages/journey/src/application/get-journey-stats.use-case.ts` — returns hardcoded values. Complete implementations before merging.
- **Inconsistent connection management**: some repositories use `pool.query()` directly while others use `pool.getConnection()` + `try/finally` + `conn.release()`. Prefer the explicit pattern.
- **`"use client"` at page level**: marking an entire page as a Client Component instead of isolating interactivity in a small child component.
- **Missing image dimensions**: using `<img>` or `next/image` without `width`/`height`, causing CLS.
- **Hardcoded UI text**: embedding strings directly in JSX instead of using translation keys.
- **`force-dynamic` on static content**: using `export const dynamic = 'force-dynamic'` when the page could be statically generated or use ISR.

## Agent Documentation
- `docs/agents/INDEX.md`: Entry point for agent-facing documentation.
- `docs/agents/DOCKER.md`: Docker deployment and operations guide.
- `docs/agents/ENVIRONMENT.md`: Environment variables and defaults.
- `docs/agents/DATABASE.md`: Database schema overview and migrations.
- `docs/agents/GOLDEN_PATHS.md`: End-to-end flows for the product.
- `docs/agents/DEBUGGING.md`: Common issues and diagnostics.

## Repo Map
- `apps/`: Application entrypoints (API, CLI, Scheduler, Web).
- `packages/`: Domain modules and shared libraries.
- `migrations/`: MariaDB schema migrations.
- `scripts/`: Dev, test, and Docker helpers.
- `.ai/commands/`: IDE-agnostic command definitions (review-code, review-seo).
- `.ai/agents/`: IDE-agnostic subagent definitions (review-security, review-duplications, review-dependencies, review-seo, review-bugs, review-refactor).

## API reference

The HTTP API lives in `apps/api/`. Routes are organized by domain in `apps/api/src/routes/`. Entry point: `apps/api/src/index.ts`.

| Method | Path | Description | Handler |
|--------|------|-------------|---------|
| GET | `/health` | Health check with DB test | `health.routes.ts` |
| GET | `/api/photos/latest` | Latest published photo | `photos.routes.ts` |
| GET | `/api/photos` | Paginated photo list with filters (`limit`, `offset`, `q`, `start_date`, `end_date`, `lang`) | `photos.routes.ts` |
| GET | `/api/photos/:id` | Photo by ID | `photos.routes.ts` |
| GET | `/api/journey/stats` | Journey statistics | `journey.routes.ts` |
| GET | `/api/journey/route` | Paginated route points (`status`, `limit`, `offset`) | `journey.routes.ts` |
| GET | `/api/journey/route/:id` | Route point by ID | `journey.routes.ts` |
| GET | `/api/map/state` | Current map state | `map.routes.ts` |
| PUT | `/api/map/state` | Update map state (bbox, zoom) | `map.routes.ts` |
| GET | `/api/map/pins` | Photo pins within bounding box (`bbox`, `limit`, `q`, `lang`) | `map.routes.ts` |
| POST | `/api/map/refresh` | Refresh map state after photo publish | `map.routes.ts` |

**Middleware stack** (applied in order): Helmet, CORS (`CORS_ORIGINS`), JSON parsing, Morgan logging, rate limiting (100 req/15min on `/api/*`), API key auth (non-development), static files (`/images`), 404 handler, error handler.

**Auth**: `Authorization: Bearer <token>` or `x-api-key` header, validated against `API_KEY` env var. Disabled in development.

## Available skills
Skills are actionable procedures. Each skill lives in its own folder with a `SKILL.md` file:
- `.ai/skills/docker-security-audit/SKILL.md`: Docker security audit workflow.
- `.ai/skills/project-foundations/SKILL.md`: Project context loader for subagents and review tasks.
- `.ai/skills/seo-audit/SKILL.md`: Coordinator workflow to run SEO subagents and consolidate a single SEO audit report for `apps/web/`.

## Available commands
Commands are reusable workflows triggered with `/` in the chat. Cursor wrappers live in `.cursor/commands/`; real logic lives in `.ai/commands/`:
- `/review-code`: Comprehensive code review using parallel subagents (security, duplications, dependencies, SEO, bugs, refactoring).
- `/review-seo`: SEO audit for `apps/web/` using parallel SEO-focused subagents (metadata, structured data, technical SEO, Core Web Vitals, a11y).

## Custom subagents
Subagents are specialized agents launched by commands. Cursor wrappers live in `.cursor/agents/`; real definitions live in `.ai/agents/`:
- `review-security`: Security vulnerability analysis.
- `review-duplications`: Duplicated code and pattern detection.
- `review-dependencies`: Layer and module dependency violation checks.
- `review-seo`: SEO, accessibility, and web performance analysis.
- `review-seo-technical`: Crawl/index technical SEO checks for `apps/web/`.
- `review-seo-canonicals`: Canonicals, duplicates consolidation, and locale signals for `apps/web/`.
- `review-seo-metadata`: Metadata, Open Graph, and Twitter Cards checks for `apps/web/`.
- `review-seo-structured-data`: JSON-LD / Schema.org checks for key pages in `apps/web/`.
- `review-seo-web-vitals`: Code-level Core Web Vitals risk checks (LCP/INP/CLS) for `apps/web/`.
- `review-seo-a11y`: Semantic HTML + accessibility checks for `apps/web/` that impact SEO.
- `review-bugs`: Potential bug and edge case identification.
- `review-refactor`: Refactoring opportunity detection.

## IDE-specific configuration
- **Cursor**: `.cursor/rules/` (rules), `.cursor/commands/` (commands), `.cursor/agents/` (subagents).
- **GitHub Copilot**: `.github/copilot-instructions.md`.

Both redirect to this file as the single entry point.

## Execution environment
This project runs entirely inside Docker. The host machine does NOT have `pnpm`, `node`, or project dependencies installed. **Every runtime command** (tests, builds, migrations, linting, scripts) MUST be executed inside the Docker containers.

| Task | Command |
|------|---------|
| Run all tests | `./scripts/test.sh` or `docker compose exec app pnpm test` |
| Run unit tests | `docker compose exec app pnpm test:unit` |
| Run integration tests | `docker compose exec app pnpm test:integration` |
| Run migrations | `docker compose exec api node scripts/run-migrations.js` or `pnpm script:db:migrate` |
| Run any script | `./scripts/docker-run.sh <command>` (wraps `docker compose exec app`) |
| Build | `docker compose exec app pnpm build` |
| Lint | `docker compose exec app pnpm lint` |

**File-scoped commands** (prefer these for faster feedback):

| Task | Command |
|------|---------|
| Type-check a single file | `docker compose exec app npx tsc --noEmit path/to/file.ts` |
| Lint a single file | `docker compose exec app npx eslint path/to/file.ts` |
| Run a single test file | `docker compose exec app npx vitest run path/to/file.test.ts` |
| Run tests matching a name | `docker compose exec app npx vitest run -t "test name"` |

**Rules:**
- NEVER run `pnpm`, `npm`, `node`, `vitest`, or `tsx` directly on the host.
- Always use `./scripts/docker-run.sh <command>` or `docker compose exec <service> <command>`.
- The `app` service is the general-purpose dev container; `api`, `web`, and `scheduler` are service-specific.
- Ensure containers are running (`docker compose up -d`) before executing commands.
- Prefer file-scoped commands over project-wide builds for faster validation.
- See `docs/agents/DOCKER.md` for full Docker operations guide.

## Safety and permissions

**Allowed without asking:**
- Read files, list directories, search code.
- Run file-scoped type-check, lint, or single test (via Docker).
- Run `./scripts/test.sh` to execute the full test suite.
- Create or modify source files, tests, and documentation.
- Run git status, git diff, git log.

**Ask the user first:**
- Install or remove dependencies (`pnpm add`, `pnpm remove`).
- Run destructive git commands (`git push`, `git reset --hard`, `git rebase`).
- Delete files or directories.
- Modify Docker configuration (`Dockerfile`, `docker-compose*.yml`).
- Run full project-wide builds (`pnpm build`).
- Change environment variables or `.env` files.
- Modify CI/CD workflows (`.github/workflows/`).
- Run database migrations or reset scripts.

## When stuck

- Ask a clarifying question or propose a short plan before making large speculative changes.
- Do NOT push large rewrites without confirmation — prefer small, focused diffs.
- If a test fails and the fix is not obvious, report the failure with the error output and ask for guidance.
- If requirements are ambiguous, propose 2-3 options with trade-offs and let the user choose.
- If you cannot find a file or pattern, check `docs/agents/INDEX.md` and module-level `AGENTS.md` files before exploring blindly.

## Global rules
- README: update `README.md` whenever a change affects setup, architecture, usage, dependencies, configuration, or commands.
- ADR: every technical or architectural decision must be recorded as an ADR in the `.adr/` folder using the corresponding template.
- Keep consistency with modular hexagonal architecture and MariaDB without ORM.
- Tests: every new feature or change must include unit and/or integration tests following `.ai/standards/test.md` guidelines.
- Language: UI copy and documentation must remain in English for consistency.
- Agent docs: update `docs/agents/INDEX.md` when adding or removing modules/apps, and keep module-level `AGENTS.md` files current.
