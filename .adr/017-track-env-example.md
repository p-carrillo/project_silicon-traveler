# ADR 017: Track .env.example in Git

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
We want developers to know which environment variables are required without exposing secrets. A blanket `.env.*` ignore pattern would also hide `.env.example`, reducing discoverability.

## Decision
Keep `.env.example` tracked by adding an explicit allow rule in `.gitignore`.

## Alternatives considered
- Ignore all `.env.*` files, including `.env.example`.
- Move environment variable documentation entirely into the README.

## Consequences
### Positive
- Clear, versioned list of required variables.
- Secrets remain excluded from Git.

### Negative
- Requires an explicit exception rule in `.gitignore`.

### Follow-ups
- None.
