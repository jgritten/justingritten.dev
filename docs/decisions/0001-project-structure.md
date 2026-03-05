# ADR 0001: Project structure (monorepo, client/server)

## Status

Accepted.

## Context

Portfolio site needs a frontend (portfolio + demos) and a foundation for future backend features without overcomplicating the repo.

## Decision

- **Monorepo** at root: `client/` (React SPA) and `server/` (.NET Web API).
- **Client:** Vite + React 19 + TypeScript; path alias `@/` → `src/`; Radix UI for components.
- **Server:** .NET 10 Web API, EF Core, repository pattern; SQLite for now as a template for future MSSQL.
- **Docs:** `docs/` at root for architecture, deployment, security, development, and ADRs.

## Consequences

- Single repo for frontend and backend; clear separation by folder.
- Deploy pipeline only builds and deploys `client/`; server can be added later.
- New contributors can follow README and `docs/development.md` for setup.
