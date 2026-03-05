# ADR 0002: Data persistence approach (client-first, API later)

## Status

Accepted.

## Context

Portfolio and demos need some data (e.g. products, file tree). We want to ship quickly and keep the option to move to a real backend later.

## Decision

- **Current:** Client can use client-side SQLite (or mocks) for demos; the app does not depend on the API for persistence in production.
- **Planned:** The API will be upgraded to MSSQL and become the primary data layer; the client will then call the API instead of client-side storage.
- **Server today:** The existing Products CRUD (EF Core, SQLite, repository pattern) is the template for that future migration and for local full-stack development.

## Consequences

- Live production site remains static and client-only until we explicitly host the API.
- When we add API-backed features, we follow the existing Products pattern (controller, DTOs, repository, DbContext).
- CORS is already configured for the React app; if the API moves to another origin (e.g. api.justingritten.dev), we extend CORS and document in [../security.md](../security.md).
