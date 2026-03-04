# justingritten.dev — Portfolio

Source for [justingritten.dev](https://justingritten.dev): personal portfolio and demo site for Justin Gritten, .NET and React developer.

## Quick start

**Frontend (React)**

```bash
cd client
npm install
npm run dev
```

App: **http://localhost:5173** (or the port Vite prints).

**Backend (optional, for later)**  
The .NET API is in place as a foundation for a future upgrade. To run it locally:

```bash
# From repo root
dotnet run --project api
```

API: **http://localhost:5237**. The client can use `VITE_API_URL` (see `client/.env.example`) when you switch to API-backed data.

## Data persistence and future switch

- **Current:** The **client** (React app) keeps an **SQLite instance** (e.g. in-browser via sql.js or similar) for saving and loading data. The app does not depend on the API for persistence yet.
- **Future:** The **API** will be upgraded to use **MSSQL** and will become the primary data layer. The client will then call the API instead of using client-side SQLite. The switch will involve:
  - Configuring the API for MSSQL (connection string, EF Core).
  - Replacing or wrapping the client’s SQLite usage with API calls (`client/src/api`, existing patterns like `useProducts()`).
  - No change to the client’s general structure—only where data is read/written.

The existing API (Products, EF Core, SQLite) is there as a template for that future backend; you can evolve or replace it when you move to MSSQL.

## CORS

**CORS is only a concern when the browser calls an API on a *different origin* (different scheme, domain, or port).**

- **Same origin:** If the React app and the API are served from the same origin (e.g. same domain and port, or same domain via a reverse proxy), the browser does not apply CORS and you don’t need to configure it.
- **Different origin:** If the API is on another origin (e.g. `https://api.justingritten.dev` and the site is `https://justingritten.dev`), the API must send `Access-Control-Allow-Origin` (and related headers) for the site’s origin. The current API already has a CORS policy; when you deploy, add your production front-end origin (e.g. `https://justingritten.dev`) to that policy.

So: plan CORS only when the API and the site are on different origins. Same-origin hosting (e.g. same domain, API under a path or subpath) avoids CORS.

## Stack

- **Frontend:** React 19, TypeScript, Vite  
- **UI:** Radix UI (`@radix-ui/themes` + primitives: Dialog, Select, Tabs, Toast, etc.)  
- **Data (current):** Client-side SQLite for persistence.  
- **Data (future):** API + MSSQL; client will use `client/src/api` and existing patterns.  
- **API (foundation):** .NET 10 Web API, EF Core, SQLite (to be replaced by MSSQL later).  

## Repo structure

- **`client/`** — React SPA (Vite). Path alias `@/` → `src/` (api, components, hooks, types, styles, utils).  
- **`api/`** — .NET Web API; foundation for future MSSQL-backed services; currently Products CRUD + SQLite, CORS configured for the React app.  

Current UI includes a FileExplorer and a ProductList (API-backed); these can stay as demos (e.g. lazy loading, state management) while you add a banner and portfolio content.

## Scripts (client)

| Command           | Action                    |
|-------------------|---------------------------|
| `npm run dev`     | Dev server (HMR)          |
| `npm run build`   | TypeScript + Vite build   |
| `npm run preview` | Preview production build  |
| `npm run lint`    | ESLint                    |

## Solution

Open **`JustingrittenDev.sln`** in Visual Studio to work on the .NET API and solution.
