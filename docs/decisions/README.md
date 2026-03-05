# Architecture decision records (ADRs)

Numbered decisions for the project (e.g. `0001-project-structure.md`). Use the next number when adding one (e.g. `0003-authentication-approach.md`).

## When to add an ADR

Add an ADR when you make a **significant** design or technical choice that future you (or recruiters) should understand. Examples:

| When you add… | Add ADR? | Also update |
|---------------|----------|-------------|
| **Login / authentication** | Yes (e.g. `0003-authentication-approach.md`) | `docs/security.md` |
| **New API surface or data model** | Yes | `docs/architecture.md`, `docs/system-overview.md` if structure changes |
| **Deployment or hosting change** | Yes | `docs/deployment.md` |
| **New major dependency or stack change** | Yes | `docs/architecture.md`, `docs/development.md` |
| **Small UI tweak or bug fix** | No | — |

## Before you check in

After implementing a feature that fits the table above:

1. Create `docs/decisions/NNNN-short-title.md` (next number, kebab-case).
2. Update the listed docs so they match the code.
3. If you use a PR, tick the “docs/ADR” checkbox in the PR template.

This keeps the repo and docs in sync so you don’t forget once the feature is merged.
