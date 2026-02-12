# ADR 057: Admin Session Secret and Login Rate Limiting

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
Admin session tokens were signed using the same credential material used for login (`ADMIN_BASIC_PASSWORD`), coupling authentication credentials and token signing.

Additionally, `/admin/login` lacked brute-force mitigation for repeated failed attempts.

## Decision
Harden admin authentication in the web app:
- Require dedicated `ADMIN_SESSION_SECRET` for token signing and validation.
- Keep `/admin` unavailable (404) when admin credentials or session secret are missing.
- Add in-memory app-level rate limiting for login attempts keyed by `IP + username`.
- Policy: 5 failed attempts within 15 minutes => block for 15 minutes.
- Return `error=too_many_attempts` from login flow when blocked.

## Alternatives considered
- Keep token signing bound to `ADMIN_BASIC_PASSWORD`.
- Move login endpoint to API and reuse Express rate limiter.
- Use delay-only throttling without explicit lockout.

## Consequences
### Positive
- Separation of concerns between credentials and token signing secret.
- Better resilience against brute-force attempts on admin login.
- Explicit operator feedback for lockout state.

### Negative
- New required env var (`ADMIN_SESSION_SECRET`) must be managed in every environment.
- In-memory limiter is per-process and non-distributed.

### Follow-ups
- Move limiter state to shared/distributed store if running multiple web instances.
- Add observability counters for failed login and lockout events.
