# Event-Planner-Main

A campus event planner starter using Node.js, Express, JWT authentication, and a **local JSON-file database for development**. Your original HTML/CSS pages are preserved in `website/`.

## Requirements
- Node.js 18 or later
- npm

## Run locally without MongoDB
1. Extract the ZIP and open this folder in VS Code.
2. Open a terminal in this folder.
3. Install dependencies: `npm install`
4. (Optional) Copy `.env.example` to `.env` and set your own `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. For quick local testing, the app also has development-only defaults.
5. Create the first admin account: `npm run seed`
6. Start the server: `npm start` (or `npm run dev`)
7. Open `http://localhost:3000`.

The first run creates `data/db.json` automatically. It stores users, events, and registrations on your computer. It is excluded from Git by `.gitignore`; do not commit real user data.

**Local demo admin defaults (change these before using real data):**
- Email: `admin@eventplanner.local`
- Password: `LocalAdmin123!Change`

If you set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, those values are used by `npm run seed`. The seed command does not reset an existing account's password.

## API overview
- `POST /api/auth/register` — create a student account (name, email, password; optional studentId)
- `POST /api/auth/login` — login; returns a bearer token
- `GET /api/auth/me` — current account (Bearer token required)
- `GET /api/events` and `GET /api/events/:id` — approved events
- `POST /api/events/:id/register` — register a signed-in student
- `GET /api/events/student/mine` — current student's registrations
- `POST /api/events/registrations/:token/check-in` — organizer/admin check-in
- `GET /api/organizer/events` — organizer's events
- `POST /api/organizer/events` — create draft or submit event (`action: "submit"`)
- `PATCH /api/organizer/events/:id/submit` — submit draft for review
- `GET /api/organizer/events/:id/attendees` — attendee list
- `GET /api/admin/summary` — admin summary
- `GET /api/admin/pending-events` — pending review queue
- `PATCH /api/admin/events/:id/review` — approve/reject with `decision` and optional `reason`
- `GET /api/admin/users` — users list
- `PATCH /api/admin/users/:id/verify-club` — verify organizer club

Protected API endpoints require `Authorization: Bearer <token>`.

## Local JSON database limitations
- Intended for learning and single-computer development only. JSON-file writes are not designed for concurrent users, multiple server instances, or production hosting.
- `data/db.json` is created automatically and stays on the local machine.
- Registration capacity checks are adequate for basic manual testing, not safe against simultaneous registration requests.
- Some existing HTML pages are still static and are not fully connected to every API endpoint. API functionality and the page UI should be tested together before claiming the whole app is complete.
- The local JWT fallback secret and demo admin credentials are for development only. Set strong unique secrets before any deployment.

## Switching to MongoDB Atlas later
This version uses `lib/store.js` as a JSON storage adapter, so adding `MONGODB_URI` alone will **not** switch the app to MongoDB. To migrate:
1. Create an Atlas cluster and database user; keep the URI private in `.env` or the hosting provider's environment settings.
2. Replace the storage operations in `lib/store.js` with MongoDB/Mongoose-backed implementations (or restore a Mongoose adapter) and update the routes as needed.
3. Migrate any test records from `data/db.json` if you want to keep them; do not upload that file publicly.
4. Test authentication, event approval, capacity enforcement, and attendance check-in against Atlas.
5. On deployment, set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `MONGODB_URI` in the host's environment settings. Remove development defaults and do not deploy the local JSON database for multi-user production.

## Before a real launch
Add automated tests, rate limiting, secure headers, robust capacity concurrency protection, organizer onboarding and role provisioning controls, email verification/password reset, privacy/data-retention policies, backups, and production logging. Review authorization for all routes and connect the frontend forms to the APIs. Do not treat this starter as production-ready until end-to-end testing is complete.
