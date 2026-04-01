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
  - `Controllers/` – Web API (e.g. `MetricsController`); HTTP routing, validation, and response mapping only
  - `Services/` – Application services (e.g. `MetricsService`): orchestration and use-case logic between controllers and repositories; infrastructure adapters (e.g. email senders implementing `IContactEmailSender`)
  - `Data/` – `AppDbContext`
  - `DTOs/` – Request/response DTOs
  - `Interfaces/` – Repository contracts (e.g. `IProductRepository`), service contracts (e.g. `IMetricsService`), and other ports (e.g. `IContactEmailSender`)
  - `Models/` – Domain entities (e.g. `Product`)
  - `Repositories/` – Persistence only (e.g. `ProductRepository`, `MetricRepository`)
- **Layering:** Prefer **controller → service → repository**. Controllers should delegate orchestration to services; repositories should not be called from controllers for multi-step or multi-dependency flows (metrics follow this pattern). **EF Core and transaction/retry behavior** stay in repositories. API endpoints accept/return **DTOs** (not EF models). See [ADR 0007](decisions/0007-thin-controllers-repository-and-dto-boundary.md).
- **API base:** `/api/Products` (and related routes). OpenAPI available in Development.
- **Metrics endpoints:** Route tracking writes with `POST /api/metrics/visit`. Use `GET /api/metrics/summary?route=...` for single-route totals and `GET /api/metrics/overview?period=hour|day|week|month` for one-call period-scoped dashboard hydration (routes, outbound CTA totals, and daily totals).
- **Provider port pattern:** Contact notification delivery uses an interface-first provider pattern. `Program.cs` selects `Resend`, `Ses` (scaffold), or `NoOp` via `EMAIL_PROVIDER`, so provider changes do not require controller changes.
- **Multi-client frontend readiness:** The API should be designed so future clients (for example an iOS app) can reuse the same backend contracts with minimal backend changes. That means stable DTO contracts, predictable error handling, and backward-compatible endpoint evolution.

## Deployment

GitHub Actions deploys **both** the client (S3/CloudFront) and the **API** (Elastic Beanstalk). See [deployment.md](./deployment.md).

## Roadmap and planning

- **Feature roadmap:** See [roadmap.md](roadmap.md) for planned features (auth, tenancy, WebSocket, notifications, layout), phased implementation order, and the reference principles used to stay on track.

## Where to extend

- **New UI/features:** Add components under `client/src/components/`, hooks under `client/src/hooks/`, and types under `client/src/types/`. Follow existing patterns (Radix UI, path alias).
- **New API surface:** Add controllers, DTOs, and repository interfaces in `server/` following the thin-controller pattern (see ADR 0007).
- **Design and decisions:** Update docs in `docs/` and add ADRs in `docs/decisions/`.
