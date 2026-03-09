# ADR 0005: Run tests in CI before deploy

## Status

Accepted.

## Context

We have client-side tests (Vitest + React Testing Library). Deploys to S3/CloudFront were running on every push to `main` without running tests. Broken code could be deployed if tests were not run locally.

## Decision

- Add a **Test (client)** step to the existing Deploy workflow (`.github/workflows/deploy.yml`).
- Run it after `npm ci` and before `npm run build`.
- Use `npm run test` (Vitest run once). If any test fails, the job fails and build/deploy steps do not run.

No separate “test” job or workflow; a single job with ordered steps keeps the pipeline simple and ensures deploy never runs when tests fail.

## Consequences

- Every push to `main` (and manual runs) must pass all client tests before artifacts are built and deployed.
- Developers get fast feedback in CI; fixing tests is required to get a green deploy.
- Documentation: `docs/deployment.md` lists the test step and states that all tests must pass.
