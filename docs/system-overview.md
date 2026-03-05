# System overview

What the site is and how it’s structured.

## Purpose

- **Portfolio:** Personal site for Justin Gritten—showcase and job applications (repo is public).
- **Demos:** UI components demonstrate patterns like lazy loading and API integration for recruiters.

**Live site:** [justingritten.dev](https://justingritten.dev)

### Demos

- **ProductList** – Primary demo: API integration and CRUD patterns. Intended for the final product.
- **FileExplorer** – Present in codebase for now; may be removed or hidden until there’s a clear reason to showcase it to recruiters.

## Frontend (client/)

- **Entry:** `client/index.html` → `client/src/main.tsx` → `App.tsx` → `FrontPage` (and future routes/components).
- **Structure:**
  - `src/api/` – API client and product endpoints
  - `src/components/` – React components (FrontPage, ProductList, FileExplorer, etc.)
  - `src/hooks/` – Custom hooks (e.g. `useFileNodes`, `useProducts`)
  - `src/types/` – TypeScript types
  - `src/styles/` – Global and component CSS
  - `src/utils/` – Shared utilities
- **Imports:** Use `@/` for `src/` (e.g. `import '@/styles/App.css'`).

## Backend (server/)

- **Entry:** `server/Program.cs` – configures EF Core (SQLite), CORS, controllers.
- **Structure:**
  - `Controllers/` – Web API (e.g. `ProductsController`)
  - `Data/` – `AppDbContext`
  - `DTOs/` – Request/response DTOs
  - `Interfaces/` – e.g. `IProductRepository`
  - `Models/` – Domain entities (e.g. `Product`)
  - `Repositories/` – Implementations (e.g. `ProductRepository`)
- **API base:** `/api/Products` (and related routes). OpenAPI available in Development.

## Deployment

Only the **client** is deployed: GitHub Actions builds the Vite app and syncs to S3; CloudFront serves the site. The server is not deployed to production today. See [deployment.md](./deployment.md).

## Where to extend

- **New UI/features:** Add components under `client/src/components/`, hooks under `client/src/hooks/`, and types under `client/src/types/`. Follow existing patterns (Radix UI, path alias).
- **New API surface:** Add controllers, DTOs, and repository interfaces in `server/` following the Products example.
- **Design and decisions:** Update docs in `docs/` and add ADRs in `docs/decisions/`.
