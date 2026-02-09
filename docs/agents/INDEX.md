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
Project standards (IDE-agnostic): `.ai/standards/` (architecture, coding, database, test, commit, subagents).

## Skills
Actionable procedures (each in its own folder with `SKILL.md`): `.ai/skills/` (docker-security-audit).

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
