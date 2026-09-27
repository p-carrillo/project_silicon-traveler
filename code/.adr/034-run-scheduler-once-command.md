# ADR 034: Run Scheduler Once Command

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
The scheduler runs generator jobs every 6 hours and publisher jobs once per day. For testing and manual operations we need a way to execute the same scheduler flow on demand without waiting for cron schedules, especially when running in Docker.

## Decision
Add a dedicated scheduler entrypoint that runs jobs once and exits. The new command accepts `--job generator|publisher|all` (or `SCHEDULER_JOB`) and is exposed via `pnpm --filter @silicon-traveler/scheduler run-once`.

## Alternatives considered
- Add a run-once flag to the existing cron scheduler entrypoint.
- Trigger generator/publisher through ad-hoc CLI commands.
- Temporarily change cron schedules to run immediately.

## Consequences
### Positive
- Enables on-demand runs without altering cron schedules.
- Works cleanly in Docker with a one-off container run.
- Keeps the existing scheduler behavior unchanged.

### Negative
- Adds a second entrypoint to maintain.
- Small amount of duplicated bootstrapping logic.

### Follow-ups
- Consider a Docker helper script if this becomes a frequent workflow.
