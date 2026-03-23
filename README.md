# justingritten.dev — Portfolio

**Live site:** [justingritten.dev](https://justingritten.dev)

Personal portfolio and demo site. This repository is **public** so I can share it with potential employers and link it on job applications—feel free to clone, run locally, and review the code.

**Stack:** React 19, TypeScript, Vite, Radix UI · .NET Web API (live backend for contact + visitor metrics)

---

## Quick start

**Frontend (React)**

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173** (or the port Vite prints).

**Backend (.NET API)**  
Run the API locally:

```bash
# From repo root
dotnet run --project server
```

API (local): **http://localhost:5237**.  
API (production): **https://api.justingritten.dev**.  
The client uses `VITE_API_URL` (see `client/.env.example`) to choose the API base URL.

---

## Architecture

**Data persistence**

- **Current:** The API persists data with EF Core + SQLite (`justingritten.db`). Profile features like contact submissions and visitor metrics are API-backed.
- **Planned:** Move the API from SQLite to a managed relational database (e.g. RDS/PostgreSQL/SQL Server) while keeping EF migrations and retry-oriented data access patterns.

**CORS**  
The API allows local frontend origins and production origins (`https://justingritten.dev`, `https://www.justingritten.dev`) so browser requests from the live site succeed.

---

## Repo structure

| Path       | Description |
|-----------|-------------|
| **`client/`** | React SPA (Vite). Path alias `@/` → `src/` (api, components, hooks, types, styles, utils). |
| **`server/`** | .NET 10 Web API; EF Core, SQLite (future: managed DB). Products + Contact + Metrics APIs, migrations, CORS configured for local and production frontend. |

The UI includes demo components (e.g. **FileExplorer**, **ProductList**) that showcase patterns like lazy loading and API integration, alongside portfolio content.

---

## Scripts (client)

| Command           | Action                    |
|-------------------|---------------------------|
| `npm run dev`     | Dev server (HMR)          |
| `npm run build`   | TypeScript + Vite build   |
| `npm run preview` | Preview production build  |
| `npm run lint`    | ESLint                    |

**Solution:** Open **`JustingrittenDev.sln`** in Visual Studio to work on the .NET API.

---

## Quick reference (run, test, query DB)

If you’re coming back to this repo after a while, here’s where to look and the main commands.

| I want to…              | Command / where to look |
|-------------------------|-------------------------|
| Run the client          | `cd client && npm install && npm run dev` → http://localhost:5173 |
| Run the API             | `dotnet run --project server` (from repo root) → http://localhost:5237 |
| Test production API health | `https://api.justingritten.dev/health` |
| Run client tests        | `cd client && npm run test` |
| Run API tests           | `dotnet test server/Api.Tests/Api.Tests.csproj` (from repo root) |
| Run one API test (or a whole test class) | `dotnet test server/Api.Tests/Api.Tests.csproj --filter "FullyQualifiedName~TestMethodName"` (one test) or `--filter "FullyQualifiedName~ClassName"` (all tests in that class). Use the exact C# method or class name. |
| Build client            | `cd client && npm run build` |
| Build API               | `dotnet build server` (from repo root) |
| Query the SQLite DB     | `cd server && sqlite3 justingritten.db` then e.g. `.tables`, `SELECT * FROM ContactMessages ORDER BY CreatedAt DESC LIMIT 20;` — **full instructions:** [docs/development.md#viewing-and-querying-database-data](docs/development.md#viewing-and-querying-database-data) |
| Reset local DB          | Delete `server/justingritten.db` (and `server/justingritten.db-wal` / `.db-shm` if present), then run the API again. |
| Add a DB migration      | `cd server && dotnet ef migrations add <MigrationName>` — see [docs/development.md](docs/development.md). |

**Run a single API test:** Use `--filter "FullyQualifiedName~Name"` where `Name` is the test method name (e.g. `Create_ValidBody_ReturnsOkAndPersistsMessage`) or the test class name (e.g. `ContactControllerTests`) to run all tests in that class. Example: `dotnet test server/Api.Tests/Api.Tests.csproj --filter "FullyQualifiedName~Create_EmptyFirstName"`.

**Detailed docs:** [docs/development.md](docs/development.md) (local run, test, DB, migrations), [docs/deployment.md](docs/deployment.md) (CI/CD, deploy).
