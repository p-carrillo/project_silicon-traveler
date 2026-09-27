# ADR 064: Adopt the Box repository layout

**Status:** Accepted
**Date:** 2026-09-22

## Context

The repository mixed deployable application code with AI-specific standards, skills, commands, designs, and seed assets at its root. This made the runtime boundary and the AI context boundary unclear.

## Decision

Adopt a Box layout:

- `code/` contains the deployable application, Docker configuration, scripts, documentation, and ADRs.
- `context/` contains AI standards, skills, agents, commands, designs, and seed assets.
- `AGENTS.md`, `.cursor/`, and CI configuration remain at the repository root because their tools discover them there.

Docker Compose is run from `code/`. Development mounts `context/` read-only for seed assets; production deploys the required seed assets beside `code/` and mounts them read-only.

## Alternatives considered

- Keep `.ai/` at the repository root.
- Put every repository artifact under `code/`.

## Consequences

### Positive

- The deployable application has an explicit, self-contained root.
- AI context is discoverable without being part of the Docker build context.
- Deployment paths and seed-image mounts are explicit.

### Negative

- Existing commands must begin with `cd code`.
- Tooling and documentation need the new `code/` and `context/` paths.

### Follow-ups

- Keep all new AI artifacts under `context/`.
- Keep production workflow paths aligned with the Box layout.
