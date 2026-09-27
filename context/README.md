# AI Context

This directory contains the non-deployable context used to guide AI-assisted work on Silicon Traveler.

| Path | Purpose | Read when |
| --- | --- | --- |
| `standards/` | Engineering, testing, architecture, database, frontend, SEO, and commit references. | When routed by `skills/project-foundations/` because they affect the task. |
| `skills/` | Repeatable workflows such as project orientation, SEO, and Docker security reviews. | A task matches a documented workflow. |
| `agents/` | Review criteria for specialised code-review roles. | Running or defining a review. |
| `commands/` | Review orchestration instructions independent of a specific IDE. | Performing a documented review workflow. |
| `task/` | Local task snapshots, refinement notes, and the recommended implementation roadmap. | Reviewing or preparing the next task. Start with [task/ROADMAP.md](task/ROADMAP.md) when prioritising work. |
| `designs/` | Visual reference assets. | Implementing or reviewing related UI. |
| `pictures_seed/` | Local images used by development seed scripts. | Running seed workflows. |

Application code and deployable configuration live in `../code/`. Repository-wide agent instructions live in `../AGENTS.md`.
