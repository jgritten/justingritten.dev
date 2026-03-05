# ADR 0003: Testing approach (Vitest for client; .NET tests later)

## Status

Accepted.

## Context

We want a test suite to guard refactors and document behavior. The repo has a React client (Vite, TypeScript) and a .NET API; coverage should start with the client, with server tests added when we invest in backend features.

## Decision

- **Client:** Use **Vitest** for unit and component tests, with **React Testing Library** for React components. Coverage is scoped to `client/src/` (v8 provider; report in `client/coverage/`). Tests live next to source as `*.test.ts` / `*.test.tsx` or in `__tests__/` as preferred.
- **Server:** No test project yet. When we add backend tests, use **xUnit** and **Microsoft.AspNetCore.Mvc.Testing** (and optionally in-memory SQLite or test DB) for API and repository tests. Client and server test stacks remain independent.

## Consequences

- Client tests run with `npm run test` / `npm run test:watch` / `npm run test:coverage` from `client/`.
- Vitest reuses Vite config (path alias `@/`, env), so no separate Jest-style transform or module mapping.
- Documentation in [development.md](../development.md) describes how to run client tests; server test commands will be added when the .NET test project exists.
