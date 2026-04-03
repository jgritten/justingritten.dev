# Development

How to run and work on the project locally.

## Prerequisites

- **Node.js** 20 (for client)
- **npm** (client uses npm; lockfile is `client/package-lock.json`)
- **.NET** (e.g. .NET 10 SDK) if you work on the API

## Frontend (React)

```bash
cd client
npm install
npm run dev
```

- App: **http://localhost:5173** (or the port Vite prints).
- **Scripts:** `npm run build`, `npm run preview`, `npm run lint`, `npm run test`, `npm run test:watch`, `npm run test:coverage`.
- **Path alias:** `@/` → `client/src/`.

### Environment

- Copy `client/.env.example` to `client/.env` if you need to override the API URL.
- `VITE_API_URL` – optional; default is `http://localhost:5237`.
- For production builds, set `VITE_API_URL` to `https://api.justingritten.dev` (or the active API domain).
- **`VITE_CLERK_PUBLISHABLE_KEY`** – optional; enables Clerk on **`/saas`** (sign-in, `UserButton`, `GET /api/v1/me` demo on the dashboard). From [Clerk Dashboard](https://dashboard.clerk.com/) → your application → **API keys** → **Publishable key**. Add **`http://localhost:5173`** (and production origins) under the app’s allowed domains in Clerk.

## Backend (.NET API)

```bash
# From repo root
dotnet run --project server
```

- API: **http://localhost:5237**.
- **Solution:** Open `JustingrittenDev.sln` in Visual Studio to work on the API.
- **OpenAPI:** Available in Development (see `Program.cs`).

### Clerk (JWT validation for `/api/v1/me`)

For local end-to-end checks with the React app, configure the API (user secrets or environment variables):

- **`CLERK_FRONTEND_API`** – Clerk **Frontend API** URL (matches JWT **`iss`**), e.g. `https://your-app.clerk.accounts.dev`. Shown in Clerk Dashboard (often under **API keys** / instance settings).
- **`CLERK_AUTHORIZED_PARTIES`** (optional) – comma-separated **origins** allowed for the JWT **`azp`** claim, e.g. `http://localhost:5173,https://www.justingritten.dev,https://justingritten.dev`. Recommended when testing from a real browser.
- **`CLERK_METADATA_ADDRESS`** (optional) – only if OIDC discovery is not at `{CLERK_FRONTEND_API}/.well-known/openid-configuration` for your instance.

- **Session token must include email for tenancy** — `GET /api/v1/Tenancy/workspace` loads pending invitations and ensures the **Northwinds Demo** invite from the **normalized email** on the Clerk session JWT. Clerk’s default session token does **not** include primary email. In [Clerk Dashboard → Sessions](https://dashboard.clerk.com/~/sessions), under **Customize session token**, add a claim, for example:
  ```json
  "email": "{{user.primary_email_address}}"
  ```
  The API also checks `primaryEmail`, `primary_email_address`, and `email_address` if you use those names instead. After saving, **sign out and sign in** so the session cookie carries the updated JWT.

If **`CLERK_FRONTEND_API`** is unset, **`GET /api/v1/me`** still returns **401** for any request (tests and clones without Clerk).

See [ADR 0010](decisions/0010-clerk-saas-authentication.md) and [ADR 0012](decisions/0012-northwinds-demo-tenant-and-auto-invite.md).

### Database and migrations

- The API uses **EF Core migrations only**; `EnsureCreated()` is not used. On startup, pending migrations are applied via `context.Database.Migrate()`.
- **Reset local DB:** Delete `server/justingritten.db` (and `justingritten.db-journal` if present). On the next run, migrations recreate the schema and seed data.
- **Schema changes:** From `server/`: run `dotnet ef migrations add <MigrationName>`. Apply with `dotnet run` (startup runs `Migrate()`). Existing data is preserved when applying new migrations.

### Viewing and querying database data

When you need to inspect or debug data (e.g. contact messages, visit metrics).

#### Local: SQLite command line

1. Install the [SQLite CLI](https://sqlite.org/cli.html) if needed (e.g. `winget install SQLite.SQLite` on Windows, or it may already be on your path).
2. From the repo root, open a terminal and go to the server directory:
   ```bash
   cd server
   ```
3. Start the SQLite shell against the database file:
   ```bash
   sqlite3 justingritten.db
   ```
4. At the `sqlite>` prompt you can run:
   - **List tables:**  
     `.tables`  
     You should see: `ContactMessages`, `VisitMetrics`, `Products`, `__EFMigrationsHistory`.
   - **Recent contact messages (last 20):**  
     `SELECT Id, FirstName, LastName, Email, CreatedAt FROM ContactMessages ORDER BY CreatedAt DESC LIMIT 20;`
   - **Contact message count:**  
     `SELECT COUNT(*) FROM ContactMessages;`
   - **Visit metrics by route and date:**  
     `SELECT Route, Date, Count FROM VisitMetrics ORDER BY Date DESC, Route;`
   - **Total visits per route:**  
     `SELECT Route, SUM(Count) AS Total FROM VisitMetrics GROUP BY Route;`
   - **Exit the shell:**  
     `.quit` or `Ctrl+D`

#### Local: GUI

- Open **`server/justingritten.db`** in [DB Browser for SQLite](https://sqlitebrowser.org/) (or another SQLite GUI). Use the “Execute SQL” tab to run the same queries as above.

#### Deployed API (Elastic Beanstalk)

- Public API domain: `https://api.justingritten.dev` (TLS terminated at ALB listener 443).
- The SQLite file lives on the instance. From the repo (with [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) configured), run `eb ssh`. On the instance, find the app’s working directory (e.g. where the deployed app runs), then run `sqlite3 justingritten.db` and use the same queries as in “Local: SQLite command line” above.

#### Future (hosted DB)

- When you switch to a managed database (e.g. RDS, SQL Server, PostgreSQL), use that provider’s console, CLI, or client tools to connect and query; the same tables and data concepts apply.

### Retry strategy (concurrency)

The API uses a **retrying execution strategy** for database operations: on SQLite transient errors (e.g. “database is locked” / “busy” under concurrent traffic), EF Core retries the operation up to 5 times with a delay. This is configured in `Program.cs` via `SqliteRetryingExecutionStrategy` in **Api.Data**. When you move to a hosted database (e.g. SQL Server, PostgreSQL), replace that with the provider’s built-in retrying strategy (e.g. `SqlServerRetryingExecutionStrategy`) in the same place; the pattern of “retry on transient failures” carries over.

## Typical workflows

- **Frontend only:** Run `client` with `npm run dev`; use mock data or no API.
- **Full stack:** Run both `client` and `server`; set `VITE_API_URL` if needed (default is correct for local).

## Testing

- **Client:** Vitest + React Testing Library. From `client/`: `npm run test` (single run), `npm run test:watch` (watch), `npm run test:coverage` (coverage report). Tests live in `src/**/*.test.{ts,tsx}`. See [ADR 0003](decisions/0003-testing-approach.md).
- **Server:** xUnit integration tests in `server/Api.Tests/`. From repo root or `server/`: `dotnet test` (or `dotnet test server/Api.Tests/Api.Tests.csproj`). Tests use `WebApplicationFactory` and a dedicated SQLite test DB; migrations are applied in test setup. CI (GitHub Actions) runs these tests on push to `main` before deploy.

## Code quality

- **Client:** `npm run lint` and `npm run test` in `client/`.
- **Server:** Use your IDE or `dotnet build` / analyzer rules as configured.

## Docs and decisions

- Design and intention: **docs/** (e.g. [architecture.md](./architecture.md), [system-overview.md](./system-overview.md)).
- Recorded decisions: **docs/decisions/**.
- When adding features, update docs and consider adding an ADR.
