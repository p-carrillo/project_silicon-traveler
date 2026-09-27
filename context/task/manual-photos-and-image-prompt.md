# Manual editorial replacement and image-prompt preview

- **Monotask ID:** `27505ed1-e301-4596-a54c-65cc4ea4bdc4`
- **Priority:** Medium
- **Status:** To do — definition synchronized
- **Category:** General
- **Depends on:** `image-variety-and-editorial-direction.md`

## Source description

Cuadrar el prompt con una generación manual de fotografías, sustituir las existentes que no funcionen y mejorar las nuevas.

## Outcome

An Admin editor can review a route point's factual context and image brief, generate a bounded number of candidate images, select or upload one approved JPEG, and publish that deliberate replacement without corrupting photo metadata or the normal scheduler pipeline.

## Scope

- Extend the existing authenticated Admin route-point edit flow with an editorial image workspace for one route point at a time.
- Show existing place data, research summary, image prompt, camera metadata, current image and image status.
- Allow an editor to change the image prompt, request up to two temporary provider candidates per explicit action, compare them, and select one; candidate generation never publishes automatically.
- Retain the existing JPEG upload path as the manual-source option, with server-side validation and thumbnail generation.
- On explicit save/publish, replace the image and required thumbnail atomically at the route point, keep its narrative/translations unless the editor changes them, and synchronise its already-published photo record through the existing publication/sync behaviour.
- Record an editorial audit entry with actor, timestamp, source (`generated` or `upload`), chosen prompt and replaced asset path; do not store provider secrets or raw image buffers in MariaDB.

## Non-goals

- No general media library, bulk replacement, free-form image editing, or automatic regeneration of the archive.
- No bypass of Admin authentication, image validation, storage boundaries, or publication status rules.

## Acceptance criteria

- An editor can inspect and revise the prompt, preview two or fewer ephemeral generated candidates, and choose one without changing live content until an explicit save.
- Uploads accept only validated JPEG within configured size/dimension limits and result in the same production image/thumbnail contract.
- Replacing an image for a published point updates the public photo consistently; failed generation/upload/save leaves the prior published asset intact.
- All destructive/paid actions have clear confirmation and accessible status/error feedback.
- The normal scheduler and CLI flows remain unchanged; prompt improvements flow through their shared content-generation code rather than Admin-only prompt formatting.

## Implementation plan

1. Audit the current Admin upload/update and photo-sync transaction boundaries, then define a small editorial-image port and audit DTO.
2. Extract image candidate generation from persistence so Admin candidates use bounded temporary storage and the same generator/thumbnail adapters.
3. Add authenticated API/proxy actions for candidate creation, candidate retrieval/cleanup, validated selection and upload replacement.
4. Build a small client island inside the server-rendered edit page for prompt editing, explicit generation, candidate selection and confirmations.
5. Add the chosen visual-brief/prompt fields from the editorial-direction task and migrate only the minimal auditable metadata once its schema decision is applied.

## Test plan

- Unit-test candidate limit, cleanup, validation, failed replacement rollback and publication synchronisation with fake ports.
- Integration-test JPEG validation and thumbnail generation with fixture files.
- Component-test confirmation, disabled busy states, accessible errors and preservation of the existing image after an error.
- Manually replace one non-production fixture point and verify public image, thumbnail and metadata.

## Risks and decisions resolved

- Provider generation costs money, so candidates are deliberately capped at two and require an explicit action.
- Existing images are never overwritten before the replacement asset and thumbnail have both been validated and stored successfully.
