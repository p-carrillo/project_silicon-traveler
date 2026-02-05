# ADR: Multilanguage Web and AI Content Storage

**Status:** Accepted
**Date:** 2026-02-05

## Context
We need bilingual UI (English + Spanish) with automatic language selection based on browser settings, a Spanish default fallback, and AI-generated text stored in all configured languages. The system uses MariaDB without an ORM and provides localized API responses for web clients.

## Decision
- Add environment-driven language configuration (`I18N_LANGUAGES`, `I18N_DEFAULT_LANGUAGE`, `I18N_CONTENT_BASE_LANGUAGE`).
- Generate base AI content in `I18N_CONTENT_BASE_LANGUAGE` and translate into all configured languages.
- Store translations in dedicated tables `route_point_translations` and `photo_translations`.
- Localize API responses via `lang` query parameter (fallbacks use `Accept-Language` and defaults).
- Localize all web UI copy through a shared translations module.

## Alternatives considered
- Store translations in JSON columns on existing tables (rejected: harder to query/filter).
- Generate independent AI content per language (rejected: inconsistent prompts, higher cost).

## Consequences
### Positive
- Consistent multilingual content stored and queryable by language.
- Clear UI localization with automatic browser detection.
- Minimal changes to existing hexagonal boundaries.

### Negative
- Additional database tables and joins in API queries.
- Added OpenAI translation calls during generation.

### Follow-ups
- Consider async translation for additional languages if cost/latency grows.
- Add admin tooling for editing translations if needed.
