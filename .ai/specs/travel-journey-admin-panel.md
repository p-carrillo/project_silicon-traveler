# Feature Spec: Travel Journey Admin Panel

## Summary
Create a secure admin panel to manage journey configuration and prompt templates. Access requires username and password, and all admin actions are protected by server-side authentication.

## Goals
- Provide a login-protected admin UI under `/admin`.
- Manage image and text prompt templates (create, update, activate/deactivate).
- Manage journeys and stops (create/update journeys, add/update/reorder stops).
- Keep the UI minimal and consistent with the public frontend.

## Non-goals
- Multi-user accounts, roles, or permissions.
- OAuth, social login, or SSO.
- Audit logs or full CMS features.
- Payment or order management.

## User stories
- As an admin, I want to log in with a username and password to access the admin panel.
- As an admin, I want to update image/text prompt templates without changing code.
- As an admin, I want to create a journey and manage its stops and order.

## Technical requirements
- Admin UI lives in `client/` with routes under `/admin`.
- All admin pages require authentication; unauthenticated users are redirected to `/admin/login`.
- Authentication uses a server-validated username/password and an httpOnly session cookie.
- Store credentials in environment variables (do not hardcode or commit secrets).
- Use server-side guards for all admin API endpoints.
- Keep UI copy and code in English.

## Frontend changes
### Routes/pages
- `/admin/login` login form (username + password).
- `/admin` admin dashboard landing page.
- `/admin/prompts` list + edit prompt templates.
- `/admin/journeys` list + create journeys.
- `/admin/journeys/[id]` edit journey details and manage stops (add/edit/reorder).
- `/admin/commands` run admin commands (manual entry generation).

### UI states
- Login failure: clear error message.
- Empty states for journeys/prompts.
- Save states: loading, success, error.
- Command execution states: running, success, error, last-run timestamp.

## API surface
### Auth endpoints (new)
- `POST /admin/login`
  - Body: `{ "username": "admin", "password": "secret" }`
  - Response: `204 No Content` and set session cookie.
- `POST /admin/logout` clears session cookie.
- `GET /admin/me` returns `{ "username": "admin" }` if authenticated.

### Journey endpoints (existing + new)
- `POST /journeys` create a journey.
- `GET /journeys/:id` fetch journey details.
- `GET /journeys` list journeys (new).
- `PATCH /journeys/:id` update journey fields (new).
- `POST /journeys/:id/stops` add a stop.
- `PATCH /journeys/:id/stops/:stopId` update a stop (new).
- `PATCH /journeys/:id/stops/order` reorder stops.
- `POST /journeys/:id/entries/generate` manual generation command.

### Prompt template endpoints (existing)
- `GET /prompt-templates`
- `POST /prompt-templates`
- `PATCH /prompt-templates/:id`

## Data model
- No new database tables required for auth; credentials are sourced from env variables.
- Reuse existing journey and prompt template tables.

## Backend changes
- Add an admin auth module:
  - Password verification (bcrypt hash comparison).
  - Session cookie creation and validation.
  - Guard/middleware to protect admin endpoints.
- Add journey list and update endpoints to support admin UI.
- Add stop update endpoint to support editing stops.

## Testing plan
- Unit tests: auth guard, password validation, session handling.
- Integration tests: login flow + protected endpoint access.
- E2E smoke: create journey, add stop, update prompt template.

## Acceptance criteria
- [ ] Admin pages require login and redirect unauthenticated users to `/admin/login`.
- [ ] Valid credentials grant access; invalid credentials show an error.
- [ ] Admin can create and edit prompt templates.
- [ ] Admin can create and edit journeys and stops, including reorder.
- [ ] Admin can run the manual generation command for a selected journey.
- [ ] Admin API endpoints are protected on the server.

## Risks and mitigations
- Credential leakage: keep credentials in env vars and avoid logging them.
- Session hijack: use httpOnly, secure cookies with short expiry.
- Brute force attempts: add basic rate limiting to login endpoint.
