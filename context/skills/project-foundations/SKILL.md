---
name: project-foundations
description: "Route code, orientation, and review work to the smallest project context that materially affects the task."
---

# Project Foundations

## Overview

This is the mandatory, compact entry point for code, orientation, and review work. It preserves project boundaries while avoiding unrelated context.

## When to Use

- Before code changes, orientation, or reviews
- Before delegating scoped work to a subagent

## Instructions

## Start with the local scope

Read the applicable `AGENTS.md` files: the root file and the nearest file below the target path. They establish the always-applicable constraints:

- Node.js + TypeScript monorepo; application commands run in Docker from `code/`.
- The domain stays pure; use cases orchestrate; adapters receive ports by dependency injection.
- SQL is parameterized and acquired MariaDB connections are released in `finally`.
- Package internals are not imported across package boundaries; behaviour changes get focused Vitest coverage.

Read the active task document only when implementing or refining that task. Read the roadmap only to choose priority. Inspect the files in scope before loading broader references.

## Load references only when relevant

| If the task affects… | Read… |
| --- | --- |
| Layer boundaries, public package contracts, or dependency direction | `context/standards/architecture.md` |
| TypeScript design, error handling, or a substantial refactor | `context/standards/coding.md` |
| Test strategy, integration dependencies, or a new test pattern | `context/standards/test.md` |
| SQL, migrations, repositories, transactions, or schema/status semantics | `context/standards/database.md` and, if table or workflow facts are needed, `code/docs/agents/DATABASE.md` |
| `apps/web` UI, React, Next.js, accessibility, images, or i18n | `context/standards/frontend.md` |
| Public metadata, crawlability, structured data, or web performance | `context/standards/seo.md` |
| CLI, scheduler, publishing, or an end-to-end product flow | `code/docs/agents/GOLDEN_PATHS.md` |
| Docker, environment variables, or a failed operational command | the relevant file in `code/docs/agents/` |
| Preparing a commit | `context/standards/commit.md` |

For a small, localized change, the root and module `AGENTS.md`, scoped code, and focused tests are normally sufficient. Use a detailed reference when it changes a decision; do not load it as a ritual.

## Delegation and reviews

The coordinator loads the relevant references once and sends each subagent a short, task-specific rule summary. A subagent reads its own review criteria and only the extra reference needed for its specialty; it does not reload this foundation or unrelated standards.
