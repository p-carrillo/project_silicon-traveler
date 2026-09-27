# AGENTS

## Box layout

- `code/` is the deployable Node.js and TypeScript monorepo. It contains applications, packages, Docker configuration, scripts, documentation, migrations, and ADRs.
- `context/` contains AI standards, skills, review criteria, commands, designs, and seed-image assets. It is not application source code.
- `.forgejo/workflows/` contains Forgejo Actions workflows. `.github/` remains only for GitHub compatibility.

Run all application commands from `code/`.

## Required context

Read the applicable files in `context/standards/` before changing code:

- Always: `coding.md`, `test.md`, and `commit.md`.
- Backend work (`code/apps/api`, `code/apps/cli`, `code/apps/scheduler`, `code/packages`): also `architecture.md` and `database.md`.
- Frontend work (`code/apps/web`): also `frontend.md` and `seo.md`.

For repository orientation and review work, use `context/skills/project-foundations/SKILL.md`.

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
