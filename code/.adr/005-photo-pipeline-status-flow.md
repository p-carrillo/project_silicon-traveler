# ADR 005: Photo Generation Pipeline and Status Flow

## Status
Accepted

## Context
The Silicon Traveler application orchestrates multiple AI services to generate daily photos:
1. Route calculation (geography)
2. Web research (context)
3. Content generation (GPT-4)
4. Image creation (DALL-E 3)
5. Thumbnail processing (Sharp)
6. Storage (filesystem)
7. Publishing (database)

We need a reliable, idempotent, and resumable pipeline that handles failures gracefully.

## Decision

### Pipeline Orchestration
The **Photo module** provides two use cases:

1. **PreparePhotoUseCase**: Orchestrates steps 1-6 (everything before publishing)
   - Input: `route_point_id` in `pending` status
   - Output: `PreparePhotoResult` with all URLs and metadata
   - Status progression: `pending` → `researched` → `content_generated` → `image_ready`
   - On error: Status set to `failed`, error message stored

2. **PublishPhotoUseCase**: Creates photos table record (step 7)
   - Input: `route_point_id` + `PreparePhotoResult`
   - Output: `photo_id`
   - Status progression: `image_ready` → `published`

### Status Flow
```
pending
  ↓ (ResearchPlaceUseCase)
researched
  ↓ (GenerateContentUseCase)
content_generated
  ↓ (GenerateImageUseCase + CreateThumbnailsUseCase + SaveImageUseCase)
image_ready
  ↓ (PublishPhotoUseCase)
published
```

**Failed state:** Any step can transition to `failed` with error message.

### Idempotency Strategy
- **Route status checks:** `PreparePhotoUseCase` rejects if status ≠ `pending`
- **Status updates:** Each step updates `route_points.status` before proceeding
- **Atomic operations:** Database updates use transactions (future improvement)
- **Retry safety:** Scheduler can re-run `PreparePhotoUseCase` for `failed` points (manual)

### Separation of Concerns
**Why split Prepare and Publish?**
1. **Testing:** Can test image generation without publishing
2. **Review:** Manual review of generated content before publishing (future)
3. **Scheduling:** Generator and Publisher run on different cron schedules
4. **Rollback:** Can discard `image_ready` points without affecting published photos

### Error Handling
**Transient errors** (network, API rate limits):
- Retry logic in adapters (3 attempts with exponential backoff)
- Status remains in last successful state (e.g., `researched`)
- Scheduler retries after cooldown

**Permanent errors** (invalid prompt, API rejection):
- Status set to `failed`
- Error message stored in `route_points.error_message`
- Manual intervention required (or skip to next point)

### Buffer Management
The **Scheduler** maintains a buffer of 10 `image_ready` route_points:
```sql
SELECT COUNT(*) FROM route_points 
WHERE status IN ('image_ready', 'content_generated');
```

If buffer < 10:
- Calculate next route point
- Run `PreparePhotoUseCase` until buffer full
- Stop when 10 photos ready

### Publishing Schedule
- **Time:** 18:00-20:00 (randomized daily)
- **Query:** `SELECT * FROM route_points WHERE status='image_ready' ORDER BY sequence LIMIT 1 FOR UPDATE`
- **Action:** Run `PublishPhotoUseCase`, mark as `published`

### Database Schema (Status Tracking)
```sql
CREATE TABLE route_points (
  id INT PRIMARY KEY AUTO_INCREMENT,
  status ENUM('pending','researched','content_generated','image_ready','published','failed'),
  error_message TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- other fields...
);

CREATE INDEX idx_status ON route_points(status);
```

## Alternatives Considered

### 1. Single Monolithic Use Case
**Pros:**
- Simpler code (one method)
- No intermediate status checks
- Easier to understand

**Cons:**
- All-or-nothing (can't separate generation from publishing)
- Harder to test individual steps
- No manual review step possible
- Long-running transactions (risky)

**Verdict:** Rejected. Separation provides flexibility and testability.

### 2. Message Queue (RabbitMQ, Redis)
**Pros:**
- Async processing
- Better scalability
- Built-in retry logic
- Distributed workers

**Cons:**
- Infrastructure complexity (another service)
- Overkill for 1 photo/day
- Harder to debug
- More moving parts

**Verdict:** Deferred. Database-based orchestration sufficient for MVP. Consider for v2 if scaling.

### 3. Saga Pattern (Event-Driven)
**Pros:**
- Distributed transactions
- Event sourcing benefits
- Clear audit trail
- Microservices-friendly

**Cons:**
- Much more complex
- Requires event store
- Overkill for simple pipeline
- Harder to reason about

**Verdict:** Rejected. Saga pattern solves problems we don't have (distributed systems).

### 4. No Status Tracking (Just Timestamps)
**Pros:**
- Simpler schema
- No enum management
- Timestamps show progress

**Cons:**
- Harder to query "what needs processing?"
- No clear state machine
- Error states unclear
- Scheduler logic complex

**Verdict:** Rejected. Status enum provides clarity and enables simple queries.

### 5. Eager Publishing (No `image_ready` Buffer)
**Pros:**
- Simpler flow (one less status)
- Photos published immediately
- No buffer management

**Cons:**
- API failures block publishing
- No review step possible
- Scheduler must wait for full pipeline (slow)
- Harder to maintain consistent schedule (18-20h)

**Verdict:** Rejected. Buffer decouples generation from publishing, improving reliability.

### 6. Pre-generate 30 Days Ahead
**Pros:**
- Always have photos ready
- No daily API calls
- Better cost predictability

**Cons:**
- Stale content if route changes
- Wasted API costs if journey paused
- Massive upfront generation time
- Scheduler complexity (when to regenerate?)

**Verdict:** Rejected. 10-point buffer balances responsiveness and reliability.

## Consequences

### Positive
- **Idempotent pipeline:** Can retry failed steps without side effects
- **Clear status flow:** Easy to query "what needs processing?"
- **Error isolation:** Failures don't block entire pipeline
- **Testability:** Each use case tests independently
- **Manual review:** Can inspect `image_ready` photos before publishing
- **Scheduling flexibility:** Generator and Publisher run on different schedules
- **Buffer protection:** Always have 10 photos ready (prevents API downtime impact)

### Negative
- **Status complexity:** 6 states to manage (`pending`, `researched`, `content_generated`, `image_ready`, `published`, `failed`)
- **Database coupling:** Status transitions tied to database updates (not event-driven)
- **No automatic retry:** Failed points require manual intervention (or separate retry job)
- **No transactional guarantees:** Steps are not atomic (e.g., image saved but database update fails)
- **Storage leaks:** If `PreparePhotoUseCase` fails after saving image, orphaned files remain

### Neutral
- 10-point buffer size is arbitrary (may need tuning based on API reliability)
- Status updates are synchronous (could be async with message queue)
- Error messages stored in database (could use logging service)

## Performance Considerations

### Pipeline Duration
- **Research:** ~2s (Brave Search API)
- **Content:** ~5s (GPT-4 API)
- **Image:** ~15s (DALL-E 3 HD)
- **Download:** ~3s (1792x1024 JPEG)
- **Thumbnails:** ~0.1s (Sharp)
- **Storage:** ~0.5s (filesystem write)
- **Total:** ~25s per photo

### Buffer Fill Time
- 10 photos × 25s = ~4 minutes (acceptable for scheduled job)

### Scheduler Frequency
- **Generator:** Every 6 hours (4x/day)
- **Publisher:** Once daily (18-20h randomized)

### Database Load
- Status updates: ~5 per photo (negligible)
- Indexes on `status` and `sequence` keep queries fast

## Failure Scenarios

### Scenario 1: DALL-E 3 API Down
- Status stuck at `content_generated`
- Scheduler retries after 6 hours
- Buffer drains (publishing continues from existing `image_ready` points)
- After 10 days, buffer empty → publishing stops until API recovers

**Mitigation:** Monitor buffer size, alert if < 3 photos ready.

### Scenario 2: GPT-4 Rate Limit
- Status stuck at `researched`
- Retry with exponential backoff
- Fallback to simple prompt if all retries fail

**Mitigation:** Fallback content prevents pipeline failure.

### Scenario 3: Filesystem Full
- Status stuck at `content_generated`
- Sharp save throws `ENOSPC` error
- Status set to `failed` with error message

**Mitigation:** Monitor disk space, alert if < 5GB free.

### Scenario 4: Database Connection Lost
- Status may not update
- Route point remains in previous state
- Retry on next scheduler run (idempotent)

**Mitigation:** Connection pool health checks, automatic reconnection.

## Implementation Notes
- `PreparePhotoUseCase` constructor accepts all dependencies (DI)
- Each status update calls `routePoint.updateStatus()` + `repository.update()`
- Error messages truncated to 500 chars (database constraint)
- Scheduler queries exclude `failed` points by default (manual review required)
- `FOR UPDATE` lock prevents concurrent publishing of same photo

## Future Improvements
1. **Transactional pipeline:** Wrap steps in database transactions
2. **Automatic retry:** Scheduler retries `failed` points (with backoff)
3. **Event sourcing:** Publish events for each status transition (audit log)
4. **Webhook notifications:** Notify on publishing success/failure
5. **Manual review UI:** Admin panel to inspect `image_ready` photos before publishing
