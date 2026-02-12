# ADR 050: Admin Login Page with Session Cookie

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
Browser-native HTTP Basic prompts are functional but provide a poor user experience for small admin panels. The project needs a custom login screen while keeping admin access protected in both development and production.

## Decision
Replace browser Basic Auth challenges with an application login page at `/admin/login`. Credentials remain configured through `ADMIN_BASIC_USER` and `ADMIN_BASIC_PASSWORD`. After successful login, the web app issues an HTTP-only signed session cookie scoped to `/admin`, and admin views expose an explicit logout action that clears that cookie.

## Alternatives considered
- Keep browser Basic Auth challenge (`WWW-Authenticate`).
- Implement a full users table with password hashing and role management.

## Consequences
### Positive
- Better UX with a first-party login form.
- Consistent auth flow in development and production.
- Session cookies remain inaccessible to client JavaScript (`httpOnly`).

### Negative
- Adds auth/session logic in the web layer.
- Requires signing and validating cookies correctly.

### Follow-ups
- Add optional failed-login telemetry for suspicious activity.
