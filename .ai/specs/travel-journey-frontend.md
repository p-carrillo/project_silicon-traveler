# Feature Spec: Travel Journey Frontend (Photo Journal)

## Summary
Deliver a minimal, coherent travel photography frontend that showcases the latest generated journey entry on the home page, provides monthly archives, individual photo detail pages, a simple shop listing for prints, and an about page. The UI should feel like a clean travel photo blog and integrate with the existing Journey backend APIs, using web-optimized images for display and keeping hi-res variants for print use.

## Goals
- Show the latest journey photo full-bleed with its generated text.
- Display location and date in a subtle, stylized overlay.
- Provide a Journey menu with links to monthly archives from journey start to current month.
- Offer month pages with photo thumbnails and detail pages per travel date.
- Provide a Shop page listing photos with a 25 EUR print call-to-action.
- Keep the design minimal, consistent, and responsive.

## Non-goals
- Authentication, user accounts, or admin tooling.
- Real payment processing or fulfillment workflows.
- Image upload, editing, or manual entry creation.
- Multi-journey selection or personalization.

## User stories
- As a visitor, I want to see the latest journey photo and story immediately.
- As a visitor, I want to browse by month and open a specific day’s photo and text.
- As a visitor, I want to understand where and when the photo was taken.
- As a visitor, I want to buy a print from a simple shop page.
- As a visitor, I want to learn about the project on an about page.

## Technical requirements
- Use Next.js App Router in `client/` and favor Server Components.
- Fetch data from `process.env.API_URL` with a safe local fallback (`http://localhost:3001`).
- Introduce `process.env.JOURNEY_ID` to select the active journey.
- Use `cache: "no-store"` for the latest entry endpoint.
- Handle loading, empty, and error states consistently across pages.
- Use `image_url_web` for full-bleed display and `image_url_thumb` for month grids.
- Keep `image_url_full` available for print workflows; avoid using it for general UI rendering.
- Keep all UI copy and code in English.

## Frontend changes
### Routes/pages
- `/` (Home): latest entry (full-bleed image + overlay text).
- `/journey/[year]/[month]` (Monthly archive): thumbnails for that month.
- `/journey/[year]/[month]/[day]` (Entry detail): full image + text + location/date.
- `/shop`: gallery of entries with print CTA.
- `/about`: project description.

### Navigation
- Top bar with links: Journey (dropdown), Shop, About.
- Journey dropdown lists months from journey `start_date` to current month.
- Each month links to `/journey/YYYY/MM`.

### UI states
- Home: latest entry missing -> “No entries yet.”
- Monthly archive: empty month -> “No photos for this month.”
- Entry detail: missing date -> 404-style message.
- Shop: empty -> “No photos available yet.”
- All pages show a clean error message if the API fails.

### Visual direction
- Minimal editorial layout, photo-forward.
- Full-bleed hero image on home with overlay text block.
- Location/date displayed subtly (small caps or light weight).
- Consistent typography and spacing across pages.
- Responsive layout for mobile (navigation collapses or stacks).

## API surface
### Existing endpoints (backend already defined)
- `GET /journeys/:id` (needs `start_date` and `timezone`)
- `GET /journeys/:id/entries/latest`

### Additional endpoints required for frontend
- `GET /journeys/:id/entries`
  - Query params:
    - `month=YYYY-MM` (optional, filters by month)
    - `limit` and `offset` (optional, for shop pagination)
  - Returns a list of entries with:
    - `id`, `travel_date`, `image_url_web`, `image_url_thumb`, `image_url_full`, `text_body`, `location`
- `GET /journeys/:id/entries/:date`
  - `:date` format: `YYYY-MM-DD`
  - Returns a single entry with full details.

### Response shape (example)
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
- No new frontend-only data model changes.
- Backend responses must include location fields per entry and image variants.

## Backend changes (API support)
- Extend entries controller to support list-by-month and get-by-date.
- Ensure `GET /journeys/:id` includes `start_date` for month generation.
- Ensure entry responses include web and thumbnail URLs.

## Testing plan
- Unit tests for date-to-route helpers (month list, path formatting).
- Integration tests for API fetch helpers (success + error).
- E2E smoke: home loads latest entry; month page lists entries; detail page renders entry.

## Acceptance criteria
- [ ] Home page shows the latest photo full-bleed with overlay text and location/date.
- [ ] Journey dropdown lists months from the journey start date.
- [ ] Month page shows thumbnails and links to day detail pages.
- [ ] Day detail page loads by date URL and shows photo + text.
- [ ] Shop page lists photos with a 25 EUR print CTA.
- [ ] About page content is present and styled consistently.
- [ ] All pages handle empty and error states gracefully.

## Risks and mitigations
- Large image payloads: render web and thumbnail variants instead of hi-res.
- Missing entry data for a month: show clear empty state.
- Variant mismatch (missing web/thumb): fall back to full image with a warning UI.
- API gaps: add list-by-month and get-by-date endpoints as specified.
