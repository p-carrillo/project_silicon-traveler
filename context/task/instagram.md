# Editorial publishing to Instagram

- **Monotask ID:** `e73ec819-9af9-4b6f-b51b-d96388ea312a`
- **Priority:** Medium
- **Status:** To do — definition synchronized
- **Category:** General

## Source description

Montar cuenta de Instagram y la API para publicar fotos del camino.

## Outcome

A newly published Silicon Traveler photo can be deliberately queued and published once to the project's Instagram professional account, with a traceable outcome and no duplicate post on retry.

## Scope

- Prepare the operational account prerequisites: Instagram professional account linked to a Facebook Page, app permissions, allowed redirect URL, credentials/secret storage and a non-production test account.
- Use the Meta Instagram API with Facebook Login for one project-owned professional account in the first release. Document the approved scopes, account/Page IDs, token owner, token-expiry check and renewal/revocation runbook; do not implement multi-account OAuth.
- Add an outbound social-publishing port and a Meta/Instagram Graph API adapter, injected only into scheduler/API composition.
- Build one caption from the already-published photo title, location, narrative and canonical public photo URL; use the public full-size image URL reachable by Meta, never an internal Docker or authenticated URL.
- Provide Admin review/queue/publish controls for an eligible published photo; automatic scheduler publication stays disabled by default.
- Persist an immutable editorial snapshot when an entry is queued: caption, locale, canonical photo URL, source image URL and source asset path. Later Admin edits or replacements do not silently alter queued/published social content.
- Persist an idempotency record per photo/platform with queued, publishing, published and failed states, external container/media ID, permalink, attempts, timestamps and safe error code.
- Treat the explicit Admin confirmation as the publish action: it creates a queued entry, and the bounded worker performs the provider calls. Failed entries retry automatically at most three times with bounded exponential backoff; subsequent retries require an explicit Admin action.
- Reconcile a timed-out or interrupted provider attempt using its stored external container/media ID before creating another container. Never create a second container once one is recorded or a published external ID is known.
- Validate the final source image URL before queueing against production public reachability requirements (absolute HTTPS URL, reachable without authentication and a supported image response).

## Non-goals

- No scraping, password automation, direct messages, comments, analytics dashboard, Stories/Reels/carousels, or cross-posting in the first release.
- No automatic content moderation or automatic publication without explicit later approval.
- No multi-account connection flow, customer OAuth onboarding or account switching; the feature operates only for the project-owned account.

## Functional contract

- Only a `published` photo with a public absolute image URL is eligible.
- Queueing captures the immutable editorial snapshot used by the provider; the publication job reads that snapshot rather than mutable route-point/photo fields.
- The configured project account, required permissions and a valid renewable server-side token are prerequisites. Missing, expired or revoked configuration disables queueing safely and reports an actionable Admin status.
- The adapter creates a single-image media container, waits/polls for its ready state within a bounded timeout, then publishes it.
- The output records the external container ID, media ID and permalink when available; provider errors are narrowed to user-safe status plus retained diagnostic code and retry classification.
- A unique `(photo_id, platform)` constraint is the idempotency boundary. Concurrent publish attempts are rejected/serialized, and an interrupted attempt is reconciled from its persisted external identifier before any new provider create call.
- Tokens remain server-only and are never returned to Admin or logged.

## Acceptance criteria

- An authenticated Admin can queue and explicitly publish an eligible photo, see its state, and follow the resulting Instagram permalink.
- Confirmation queues an immutable snapshot and starts asynchronous publication; the Admin can see whether the entry is queued, publishing, published or failed.
- A duplicate click, retry after timeout, worker restart, or database failure after container creation does not create a duplicate post.
- Ineligible/unreachable images and provider failures yield a clear error without changing the source photo's publication state.
- Credentials are configured outside version control; missing configuration disables the feature safely and visibly to Admin.
- Replacing or editing the source photo after queueing does not mutate the queued/published social snapshot; a new post requires an explicit later product decision.
- Automatic retries stop after three classified recoverable failures; further retry requires an explicit Admin action and remains idempotent.
- Automated tests cover adapter mapping with mocked HTTP, state transitions, idempotency and retries; a manual test uses the configured non-production account before enabling production credentials.

## Implementation plan

1. Validate the project-owned Meta account, linked Page, test account, current Graph API requirements and Facebook Login scopes; record the token renewal/revocation runbook and provider-specific choices in an ADR.
2. Verify that production storage exposes supported source images through stable public HTTPS URLs reachable by Meta; define the preflight validator and failure message.
3. Define social publication domain types, immutable editorial snapshot, port, repository port and idempotency/reconciliation state machine.
4. Add an additive migration and MariaDB repository with parameterized SQL, a unique `(photo_id, platform)` key, persisted external container IDs and transaction-safe state transitions.
5. Implement the Graph API adapter, configuration validation and dependency injection; add a worker/job for bounded asynchronous publication, polling, reconciliation and retry classification.
6. Add Admin review/confirmation/queue controls, public-image URL validation and visible state/errors; retain auto-publishing as an explicitly separate follow-up decision.

## Test plan

- Unit-test eligibility, caption construction/truncation, immutable snapshot creation, state transitions, concurrency/idempotency, reconciliation and retry classification.
- Integration-test repository constraints and transaction boundaries when MariaDB is available.
- Adapter-test Graph requests/responses using mocked HTTP, including persisted-container reconciliation after timeout; no real credential in automated tests.
- Component-test confirmation wording, disabled/busy states, configuration errors and the visible queue/publish lifecycle.
- Manually publish one test photo to the non-production account and verify public image retrieval, permalink, duplicate prevention, token/configuration errors and error observability.

## Risks and decisions resolved

- Meta API capabilities and approval requirements change; they are deliberately verified at implementation time, not assumed from this definition.
- The initial product choice is human-reviewed, single-image publishing. Automatic scheduler posting is a separate decision after operational validation.
- A database uniqueness constraint alone cannot prevent duplication after a provider-side partial success. Persisting and reconciling the external container/media ID is therefore part of the idempotency boundary.
- A queued post is an editorial decision at a point in time, so its caption and asset reference are immutable snapshots rather than live views of mutable photo records.
