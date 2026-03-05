# justingritten.dev — Portfolio

**Live site:** [justingritten.dev](https://justingritten.dev)

Personal portfolio and demo site. This repository is **public** so I can share it with potential employers and link it on job applications—feel free to clone, run locally, and review the code.

**Stack:** React 19, TypeScript, Vite, Radix UI · .NET Web API (foundation for future backend)

---

## Quick start

**Frontend (React)**

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173** (or the port Vite prints).

**Backend (optional)**  
The .NET API is in place as a foundation for a future upgrade. To run it locally:

```bash
# From repo root
dotnet run --project server
```

API: **http://localhost:5237**. The client can use `VITE_API_URL` (see `client/.env.example`) when using API-backed data.

---

## Architecture

**Data persistence**

- **Current:** The client (React app) uses a client-side SQLite instance (e.g. in-browser) for saving and loading data. The app does not depend on the API for persistence yet.
- **Planned:** The API will be upgraded to MSSQL and become the primary data layer; the client will then call the API instead of client-side SQLite. The existing API (Products, EF Core, SQLite) is a template for that migration.

**CORS**  
Relevant only when the browser calls an API on a different origin. Same-origin hosting avoids CORS; if the API is on a different subdomain (e.g. `api.justingritten.dev`), the API’s CORS policy includes the front-end origin.

---

## Repo structure

| Path       | Description |
|-----------|-------------|
| **`client/`** | React SPA (Vite). Path alias `@/` → `src/` (api, components, hooks, types, styles, utils). |
| **`server/`** | .NET 10 Web API; EF Core, SQLite (future: MSSQL). Products CRUD, CORS configured for the React app. |

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
