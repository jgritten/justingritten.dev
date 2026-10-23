# justingritten.dev

Justin's portfolio and demo hub: React + Vite SPA with a .NET Web API (contact and visitor metrics), live at `justingritten.dev`. **The repo is public**, so nothing secret goes in code, docs or commits.

Instructions for AI coding agents in this repo. Cursor reads this file directly and Claude Code reads it through `CLAUDE.md`. Cursor-only commit-prep rules live in `.cursor/rules/`; Justin's cross-repo Cursor rules live in `~/.cursor/rules/`.

## Working rules

- **Never stage, commit or push.** Justin reviews the diff and commits by hand. Suggest a commit message if it helps.
- **No scratch files in the repo**, even temporarily. Notes, diagnostics and test output go in the chat or a folder outside the repo.
- **Challenge weak assumptions.** Prefer honest disagreement over assent; name the issue and a better path.
- **Console steps are full click-paths.** For AWS, Squarespace, Clerk or GitHub, give numbered steps from the service's home page, one procedure at a time, ending with a checkpoint.

## Project docs and intention

When implementing a **new feature** or making **architectural changes**, use the project documentation so that work aligns with design and intent.

### Where to look

- **Root docs:** `docs/` at the repo root.
  - `docs/architecture.md` – High-level architecture, data flow, tech choices.
  - `docs/system-overview.md` – What the site is, frontend/backend layout, where to extend.
  - `docs/development.md` – How to run client and server locally, scripts, env.
  - `docs/deployment.md` – CI/CD, S3/CloudFront, what gets deployed.
  - `docs/security.md` – Public repo, no secrets in client, CORS, future auth.
- **Decisions:** `docs/decisions/` – ADRs; see `docs/decisions/README.md` for when to add one and which docs to update.
- **Diagrams:** `docs/diagrams/` – site Mermaid in `architecture.md`; Estimator ops map in
  `docs/diagrams/estimator-operations.md`; PNGs can be added in `docs/diagrams/`.

### How to use

1. **Before implementing a feature:** Read the relevant docs (e.g. architecture, system-overview) so the change fits the current design.
2. **When changing structure or data flow:** Update `docs/architecture.md` or `docs/system-overview.md` and add an ADR in `docs/decisions/` if the decision is significant.
3. **When adding deployment or security steps:** Update `docs/deployment.md` and `docs/security.md` accordingly.
4. **When changing Estimator routes, APIs, pipeline statuses, pricing/AI/ingest, or Jobber sync:** Update [`docs/diagrams/estimator-operations.md`](docs/diagrams/estimator-operations.md) in the same change.

### Mandatory doc updates (do not skip)

When you implement any of the following, **you must** add an ADR and update the listed docs before considering the feature complete:

| Feature type | Add ADR in `docs/decisions/` (next number) | Update these docs |
|--------------|--------------------------------------------|-------------------|
| **Login / authentication** | Yes (e.g. `0003-authentication-approach.md`) | `docs/security.md` |
| **New API surface or data model** | Yes | `docs/architecture.md`; `docs/system-overview.md` if structure changes |
| **Estimator flow / integration change** | Yes if API/data model; else diagram only | `docs/diagrams/estimator-operations.md` (always); architecture/system-overview/intake as needed |
| **Deployment or hosting change** | Yes | `docs/deployment.md` |

Propose the ADR and doc edits in the same change (or immediate follow-up) as the feature so they are not forgotten at check-in.

## Site map and modules

This site is a **demo hub** for Justin Gritten as a developer, plus focused product/SaaS modules.

### Top-level structure (client SPA)

- **Portfolio shell**: `GlobalLayout` — `GlobalMenuBar` (tabs), main content, `Footer` for `/`, `/build`, and as the outer wrapper for `/saas/*` and `/estimator/*`.
- **SaaS shell**: `SaasAppShell` — reuses `MenuBar`, `Sidebar`, shared `AppShell.css` for `/saas/*` (dashboard, product settings, etc.).
- **Legacy**: `AppShell.tsx` (full shell component) is not mounted on a route today; portfolio uses `GlobalLayout` instead.
- **Landing route**: `/` is the **Profile** module (showcase Justin, current work, process, roadmap, GitHub activity).
- **SaaS settings**: `/saas/settings/*` (Account, Application, Client, Users) — components under `client/src/Components/SaaS/Settings/`; shared SaaS CRUD UI (e.g. slide panel) under `client/src/Components/SaaS/` for reuse outside Settings.

### Modules (conceptual)

- **Profile module**
  - Purpose: Portfolio-style overview of Justin as a developer.
  - Route: `/` (shell index route).
  - Content: Existing dashboard-style widgets (Welcome, CI/CD, Roadmap, Recent Activity) focused on Justin and this repo.

- **Estimator module**
 - Purpose: Landscaping estimate MVP for a real client prospect (see `docs/intake/landscaping-estimator-project-brief.md`).
 - Routes: `/estimator` (entry: Clerk sign-in or guest), `/estimator/chat` (AI intake chat), `/estimator/admin` (quote-request inbox; sidebar link for everyone, sign-in still required to load data), `/estimator/utility` (Excel ingest pipeline; members only).
 - Shell: `EstimatorShell` (sidebar + content via `estimatorSidebarConfig`; no inner menu bar — lighter than `SaasAppShell`). Components under `client/src/Components/Estimator/`; session state in `EstimatorSessionContext`.

- **Products area**
 - Purpose: Entry point into focused demos that behave like SaaS products.
 - Sidebar: Grouped under a "Products" header in the main sidebar.
 - Routes (planned):
 - `/products/commercial-saas` – primary **Commercial SaaS** demo, with its own dashboard-style experience.

### Intent for future work

- Keep **one React SPA** here as the hub; each new demo/product is a **module** with its own route subtree, not a completely separate app.
- If a product ever becomes a real standalone SaaS, it can move to its own repo/domain, but the portfolio will still link into it from the Products area.
- When adding or renaming modules/routes, update this file so future agents understand the navigation model.
- When adding or renaming **routes, pages, or major navigation entries**, review and update `docs/sitemap.md` so the human-facing sitemap stays in sync with the app and this file.
