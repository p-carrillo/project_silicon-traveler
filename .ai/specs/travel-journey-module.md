# Feature Spec: Travel Journey Module (AI Photo Diary)

## Summary
Create a new backend module that simulates a photographer traveling the world. Each day, the system generates one photo and a companion text using OpenAI, based on prompt templates stored in the database. Images are saved to external object storage, while the database keeps metadata and URLs for multiple variants (hi-res, web, thumbnail). The module also manages an ordered itinerary of travel stops that define the journey stages. This phase is backend-only; frontend work will follow later.

## Goals
- Generate one photo + text entry per day for each active itinerary.
- Store and manage prompt templates in the database for both image and text generation.
- Persist image files in external object storage and store only URLs/metadata in the database.
- Model itineraries with ordered stops and clear place definitions.
- Keep the module aligned with the hexagonal architecture conventions.
- Focus the system on a single journey around the world.

## Non-goals
- User authentication/authorization.
- Manual image uploads or edits to generated images.
- Real-time location tracking.
- Multi-language content generation.
- Production-grade admin UI for prompt management.

## User stories
- As an admin, I want to define and reorder travel stops for a journey.
- As an admin, I want to update prompt templates without changing code.

## Technical requirements
- Use OpenAI APIs for text and image generation.
- Make OpenAI model selection configurable (per prompt or per generation request).
- Store prompt templates in MariaDB with variable placeholders (example: `{{location}}`, `{{date}}`, `{{stage}}`).
- Generate exactly one entry per day per active itinerary (idempotent).
- Use external object storage (S3-compatible) for image files, with a minimal placeholder implementation until a provider is selected.
- Store image URLs, prompt references, and generation metadata in the database.
- Generate and store image variants per entry:
  - Original hi-res (for print fulfillment).
  - Web-optimized compressed image (for UI).
  - Thumbnail image (for month grids).
- Use a scheduler to trigger daily generation (server-side), with a manual trigger endpoint for debugging.
- Keep controllers thin; generation logic belongs in application handlers/services.
- Follow the hexagonal module structure defined in `docs/architecture/module-structure.md`.

## API surface
### Endpoints
- `POST /journeys` create a journey itinerary.
- `GET /journeys/:id` fetch itinerary details with ordered stops.
- `POST /journeys/:id/stops` add a stop to an itinerary.
- `PATCH /journeys/:id/stops/order` reorder stops by sequence.
- `GET /journeys/:id/entries/latest` fetch the latest generated entry.
- `GET /journeys/:id/entries` list entries (optionally filtered by month).
- `GET /journeys/:id/entries/:date` fetch a single entry by travel date (`YYYY-MM-DD`).
- `POST /journeys/:id/entries/generate` manually trigger daily generation (debug/admin).
- `GET /prompt-templates` list prompt templates.
- `POST /prompt-templates` create a prompt template.
- `PATCH /prompt-templates/:id` update a prompt template.

### Query parameters
- `GET /journeys/:id/entries?month=YYYY-MM` filter entries by month.
- `GET /journeys/:id/entries?limit=30&offset=0` paginate entries (optional).

### Request/Response (examples)
```json
{
  "journey": {
    "id": "uuid",
    "name": "World Photo Journey",
    "status": "active",
    "timezone": "UTC",
    "stops": [
      {
        "id": "uuid",
        "title": "Lisbon",
        "city": "Lisbon",
        "country": "Portugal",
        "sequence": 1,
        "description": "Old town streets and tiled facades."
      }
    ]
  }
}
```

```json
{
  "entry": {
    "id": "uuid",
    "travel_date": "2024-06-15",
    "image_url_full": "https://example.com/photo-full.jpg",
    "image_url_web": "https://example.com/photo-web.jpg",
    "image_url_thumb": "https://example.com/photo-thumb.jpg",
    "text_body": "A slow morning by the river...",
    "location": {
      "title": "Lisbon",
      "city": "Lisbon",
      "country": "Portugal"
    }
  }
}
```

## Data model
```sql
CREATE TABLE journey (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NULL,
  status ENUM('draft', 'active', 'completed') NOT NULL DEFAULT 'draft',
  start_date DATE NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE journey_stop (
  id CHAR(36) PRIMARY KEY,
  journey_id CHAR(36) NOT NULL,
  title VARCHAR(128) NOT NULL,
  city VARCHAR(128) NULL,
  country VARCHAR(128) NULL,
  description TEXT NULL,
  sequence INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journey(id)
);

CREATE TABLE prompt_template (
  id CHAR(36) PRIMARY KEY,
  key_name VARCHAR(64) NOT NULL UNIQUE,
  kind ENUM('image', 'text') NOT NULL,
  template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE journey_entry (
  id CHAR(36) PRIMARY KEY,
  journey_id CHAR(36) NOT NULL,
  journey_stop_id CHAR(36) NOT NULL,
  travel_date DATE NOT NULL,
  stage_index INT NOT NULL,
  image_url_full VARCHAR(512) NOT NULL,
  image_url_web VARCHAR(512) NOT NULL,
  image_url_thumb VARCHAR(512) NOT NULL,
  image_storage_key_full VARCHAR(256) NOT NULL,
  image_storage_key_web VARCHAR(256) NOT NULL,
  image_storage_key_thumb VARCHAR(256) NOT NULL,
  text_body TEXT NOT NULL,
  image_prompt_id CHAR(36) NOT NULL,
  text_prompt_id CHAR(36) NOT NULL,
  image_model VARCHAR(64) NOT NULL,
  text_model VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (journey_id) REFERENCES journey(id),
  FOREIGN KEY (journey_stop_id) REFERENCES journey_stop(id),
  FOREIGN KEY (image_prompt_id) REFERENCES prompt_template(id),
  FOREIGN KEY (text_prompt_id) REFERENCES prompt_template(id),
  UNIQUE (journey_id, travel_date)
);
```

## Backend changes
- Modules touched: new `journey` module under `server/src/modules/journey`.
- New ports (interfaces):
  - `IJourneyRepository`, `IJourneyStopRepository`, `IJourneyEntryRepository`
  - `IPromptTemplateRepository`
  - `IImageGenerator`, `ITextGenerator` (OpenAI adapters, model configurable)
  - `IImageStorage` (S3-compatible storage adapter with a thin placeholder implementation)
  - `IImageProcessor` (generate web + thumbnail variants from the hi-res image)
- New adapters (controllers/persistence):
  - Controllers for journeys, entries, and prompt templates.
  - Persistence adapters using TypeORM entities for each table.
  - Image processing adapter (e.g., Sharp) to create compressed variants.
- Scheduling:
  - Daily cron job (`@nestjs/schedule`) to call a `GenerateDailyJourneyEntryCommand` for each active journey.
  - Idempotent behavior based on `journey_id + travel_date`.
- Error handling strategy:
  - Fail generation if prompts are missing or inactive.
  - Skip completed journeys (no remaining stops).
  - Log external API errors without leaking secrets.

## Frontend changes
- Out of scope for this phase (backend-only delivery).

## Testing plan
- Unit tests:
  - Journey entry generation handler (select stop, render prompts, persist entry).
  - Prompt template rendering utility.
- Integration tests:
  - Repository implementations for journey and entry persistence.
- E2E tests:
  - `POST /journeys` + `POST /journeys/:id/stops` + `POST /journeys/:id/entries/generate`.
  - `GET /journeys/:id/entries?month=YYYY-MM` + `GET /journeys/:id/entries/:date`.

## Acceptance criteria
- [ ] A single journey and its ordered stops can be created and fetched.
- [ ] Prompt templates are stored in the database and used for generation.
- [ ] Daily generation creates one entry per day per active journey.
- [ ] Entries can be listed by month and fetched by travel date.
- [ ] Image variants (hi-res, web, thumbnail) are generated and stored per entry.
- [ ] Images are stored via an external storage interface, with a minimal placeholder adapter until a provider is chosen.
- [ ] Each generated entry contains both an image and a text body.
- [ ] All changes follow the hexagonal module structure.

## Risks and mitigations
- OpenAI rate limits or failures: add retry with backoff and clear error logs.
- External storage outages: fail generation and retry on next run.
- Prompt quality issues: keep templates editable via DB.

## Open questions
- Which S3-compatible storage should be used in development (MinIO or another service)?
