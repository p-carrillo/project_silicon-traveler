# Agent Docs Index

## Start Here
- `AGENTS.md`: Global agent rules, standards, and orchestration.
- `README.md`: Setup and operational commands.
- `docs/agents/DOCKER.md`: Docker deployment and operations guide.
- `docs/agents/ENVIRONMENT.md`: Required environment variables and defaults.
- `docs/agents/DATABASE.md`: MariaDB schema overview and migration notes.
- `docs/agents/GOLDEN_PATHS.md`: End-to-end flows for the core product.
- `docs/agents/DEBUGGING.md`: Common issues and how to resolve them.

## Standards
Project standards (IDE-agnostic) in `.ai/standards/`, grouped by context:

**Common** (always apply): architecture, coding, test, commit, subagents.
**Backend** (`apps/api`, `apps/cli`, `apps/scheduler`, `packages/*`): database.
**Frontend** (`apps/web`): frontend, seo.

## Skills
Actionable procedures (each in its own folder with `SKILL.md`): `.ai/skills/` (docker-security-audit, project-foundations).

## Commands
Reusable workflows triggered with `/` in chat. Cursor wrappers in `.cursor/commands/`, real logic in `.ai/commands/`:
- `/review-code`: Comprehensive code review using parallel subagents.
- `/prueba`: Minimal smoke test command that returns a fixed success message.
- `/prueba-codex`: Minimal smoke test command that returns a fixed success message.

## Custom Subagents
Specialized agents used by commands. Cursor wrappers in `.cursor/agents/`, real definitions in `.ai/agents/`:
- `review-security`, `review-duplications`, `review-dependencies`, `review-seo`, `review-bugs`, `review-refactor`.

## Apps
- `apps/api/AGENTS.md`: HTTP API for photos, journey, and map state.
- `apps/cli/AGENTS.md`: CLI commands for migrations and journey setup.
- `apps/scheduler/AGENTS.md`: Cron-based generator and publisher jobs.
- `apps/web/AGENTS.md`: Next.js frontend consuming the API.

## Packages
- `packages/content/AGENTS.md`: LLM content generation and prompts.
- `packages/image/AGENTS.md`: Image generation and thumbnailing.
- `packages/journey/AGENTS.md`: Journey domain model and persistence.
- `packages/map/AGENTS.md`: Map state and photo pins.
- `packages/photo/AGENTS.md`: Photo preparation and publishing pipeline.
- `packages/research/AGENTS.md`: Brave search adapter and research use case.
- `packages/route/AGENTS.md`: Route point computation and persistence.
- `packages/shared/AGENTS.md`: Shared MariaDB pool and utilities.
- `packages/storage/AGENTS.md`: Storage ports and local adapter.
