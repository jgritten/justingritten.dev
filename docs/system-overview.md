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

- **Entry:** `client/index.html` → `client/src/main.tsx` → `App.tsx` (React Router) → **AppShell** (menu bar, sidebar, content area) with **Dashboard** as the default view. Visitors land in the app as **Guest** with no login required (Phase 0 foundation; see [roadmap](roadmap.md)).
- **Shell (Phase 0):** Three-section layout: (1) **Menu bar** – favicon (desktop) or hamburger (mobile) left, app name (“justingritten.dev”) centered, user dropdown (Guest / Theme settings / Sign in placeholder / GitHub link) right; (2) **Sidebar** – Dashboard, divider, Create New, Search, Settings (stickied to bottom); Create New and Search open placeholder modals; Settings opens a sub-menu (Account, Application, Client) with placeholder pages; (3) **Content** – main area driven by sidebar/route; default is Dashboard (portfolio hero + GitHub link). **Theme:** Appearance, accent, gray, radius configurable via user dropdown → Theme settings; persisted in localStorage. **Footer:** Favicon, Resume, LinkedIn, Email. **Mobile:** Hamburger opens a slide-out sidebar (icon strip + optional settings sub-menu); transitions match desktop two-column behaviour when in Settings.
- **Structure:**
  - `src/api/` – API client and product endpoints
  - `src/components/` – React components (AppShell, MenuBar, Sidebar, Dashboard, Settings, Footer, FrontPage, ProductList, FileExplorer, etc.)
  - `src/contexts/` – Theme context (theme state + persistence)
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
  - `Services/` – Infrastructure services (e.g. email provider adapters implementing `IContactEmailSender`)
- **Controller and data-access policy:** Keep controllers thin. Controllers handle HTTP concerns only; all EF Core and transaction/retry behavior belongs in repositories behind interfaces. API endpoints should accept/return DTOs (not EF models) to keep front-end/back-end contracts stable.
- **API base:** `/api/Products` (and related routes). OpenAPI available in Development.
- **Provider port pattern:** Contact notification delivery uses an interface-first provider pattern. `Program.cs` selects `Resend`, `Ses` (scaffold), or `NoOp` via `EMAIL_PROVIDER`, so provider changes do not require controller changes.
- **Multi-client frontend readiness:** The API should be designed so future clients (for example an iOS app) can reuse the same backend contracts with minimal backend changes. That means stable DTO contracts, predictable error handling, and backward-compatible endpoint evolution.

## Deployment

Only the **client** is deployed: GitHub Actions builds the Vite app and syncs to S3; CloudFront serves the site. The server is not deployed to production today. See [deployment.md](./deployment.md).

## Roadmap and planning

- **Feature roadmap:** See [roadmap.md](roadmap.md) for planned features (auth, tenancy, WebSocket, notifications, layout), phased implementation order, and the reference principles used to stay on track.

## Where to extend

- **New UI/features:** Add components under `client/src/components/`, hooks under `client/src/hooks/`, and types under `client/src/types/`. Follow existing patterns (Radix UI, path alias).
- **New API surface:** Add controllers, DTOs, and repository interfaces in `server/` following the thin-controller pattern (see ADR 0007).
- **Design and decisions:** Update docs in `docs/` and add ADRs in `docs/decisions/`.
