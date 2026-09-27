# AGENTS

## Box layout

- `code/` is the deployable Node.js and TypeScript monorepo. It contains applications, packages, Docker configuration, scripts, documentation, migrations, and ADRs.
- `context/` contains AI standards, skills, review criteria, commands, designs, and seed-image assets. It is not application source code.
- `.forgejo/workflows/` contains Forgejo Actions workflows. `.github/` remains only for GitHub compatibility.

Run all application commands from `code/`.

## Required context

For code, orientation, or review work, use `context/skills/project-foundations/SKILL.md`. It is the mandatory, compact entry point and routes to detailed references only when they affect the task.

Do not load standards, task files, product flows, designs, or operational guides merely because they exist. Read the active task file when implementing or refining that task; read `task/ROADMAP.md` only when prioritising work.

## Non-negotiable rules

- Keep the domain layer pure. Use cases orchestrate business logic; adapters receive ports by dependency injection.
- Use `unknown` and narrow it rather than using `any`.
- Use parameterized SQL only. Release each MariaDB connection in a `finally` block.
- Do not import another package's internal `src/`; use its public entry point.
- Frontend defaults to Server Components. Keep client components small, use translation keys, semantic HTML, and explicit Next Image dimensions.
- Add or update focused Vitest coverage for behaviour changes.
- Do not add production dependencies, alter Docker or CI configuration, run migrations, or use destructive Git commands without user approval.

## Execution environment

The project runs in Docker. Do not run `pnpm`, `npm`, `node`, `vitest`, or `tsx` on the host.

Before marking a task that changes the website or its UI complete, inspect the affected page in a browser when one is available. Otherwise, request it from the running web service in Docker and check its HTTP status and rendered response, then inspect the relevant web logs for runtime errors. A successful build alone does not confirm the page works; when authentication blocks the page, report that limitation explicitly.

```bash
cd code
docker compose exec app pnpm test
docker compose exec app npx vitest run path/to/file.test.ts
docker compose exec app npx eslint path/to/file.ts
```

See `code/docs/agents/DOCKER.md` for operational details.

## Documentation and decisions

- Update `README.md` when setup, architecture, usage, dependencies, configuration, or commands change.
- Record architectural decisions in `code/.adr/` using its template.
- Keep `code/docs/agents/INDEX.md` and module-level `AGENTS.md` current when modules change.
- UI copy and documentation are in English.

## Task tracking

- Each task has exactly one Markdown file in `context/task/`.
- Consult the [task roadmap](context/task/ROADMAP.md) when choosing implementation order; it is a planning guide, while each task file remains the source of truth for its scope and status.
- Define and refine the task locally first: scope, acceptance criteria, implementation plan, risks, and open decisions.
- Do not create, update, move, complete, or delete a Monotask task until the user explicitly approves synchronization.
- After approval and a Monotask task exists, keep its title, description, priority, status, lifecycle, and ID synchronized with the local file.

## Key paths

- API: `code/apps/api/src/index.ts`
- Web: `code/apps/web/`
- Domain packages: `code/packages/`
- Context: `context/README.md`
- Tasks: `context/task/`
- Task roadmap: [context/task/ROADMAP.md](context/task/ROADMAP.md)
- Agent documentation: `code/docs/agents/INDEX.md`
