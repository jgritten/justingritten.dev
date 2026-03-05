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
- **Scripts:** `npm run build`, `npm run preview`, `npm run lint`.
- **Path alias:** `@/` → `client/src/`.

### Environment

- Copy `client/.env.example` to `client/.env` if you need to override the API URL.
- `VITE_API_URL` – optional; default is `http://localhost:5237`.

## Backend (.NET API)

```bash
# From repo root
dotnet run --project server
```

- API: **http://localhost:5237**.
- **Solution:** Open `JustingrittenDev.sln` in Visual Studio to work on the API.
- **OpenAPI:** Available in Development (see `Program.cs`).

## Typical workflows

- **Frontend only:** Run `client` with `npm run dev`; use mock data or no API.
- **Full stack:** Run both `client` and `server`; set `VITE_API_URL` if needed (default is correct for local).

## Code quality

- **Client:** `npm run lint` in `client/`.
- **Server:** Use your IDE or `dotnet build` / analyzer rules as configured.

## Docs and decisions

- Design and intention: **docs/** (e.g. [architecture.md](./architecture.md), [system-overview.md](./system-overview.md)).
- Recorded decisions: **docs/decisions/**.
- When adding features, update docs and consider adding an ADR.
