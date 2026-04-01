# ADR 0007: Thin controllers with repository and DTO boundaries

## Status

Accepted.

## Context

The server evolved with mixed patterns: some controllers already delegated persistence to repositories, while others performed EF Core queries, writes, and retry logic directly in controller actions.

That drift makes API layers inconsistent and increases coupling between HTTP endpoint code and data-access details.

## Decision

- Controllers are responsible for HTTP concerns only:
  - Routing
  - Input validation and normalization
  - HTTP response shaping/status codes
- Controllers must not contain EF Core persistence/query logic or transaction/retry logic.
- **Application orchestration** (use cases that coordinate repositories and other ports—email, future auth, multiple reads/writes) should live in **services** (`server/Services/` with interfaces in `server/Interfaces/`), so the typical flow is **controller → service → repository**. Repositories remain persistence-only.
- Data access and persistence behavior must live in repository interfaces and implementations under `server/Interfaces` and `server/Repositories`.
- API request/response contracts must use DTOs in `server/DTOs` rather than exposing EF entities directly.
- Existing and new endpoints should follow this pattern consistently (`Products`, `Contact`, `Metrics`). **Note:** Some endpoints may still call repositories (and ports like `IContactEmailSender`) from the controller until refactored into a dedicated service; new work should prefer the service layer.

## Consequences

- Server architecture is consistent and easier to extend safely.
- Data-access changes (query shape, retry behavior, transaction handling) can evolve without changing controller contracts.
- Front-end/back-end contracts are explicit and stable through DTOs.
- Unit/integration testing is cleaner because controller behavior and repository behavior can be reasoned about separately.
