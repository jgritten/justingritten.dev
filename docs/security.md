# Security

Security-relevant choices and practices for justingritten.dev.

## Repository and visibility

- The repo is **public** by design (portfolio, shareable with employers). Assume no secrets in the codebase.

## Frontend

- **No secrets in client code:** Do not put API keys or secrets in `client/` or in env vars that are baked into the build (e.g. `VITE_*`). These are visible in the built bundle.
- **API URL:** `VITE_API_URL` is for pointing at an API base (e.g. localhost or a future public API). It is not a secret.

## Backend (API)

- **CORS:** The API allows specific origins (e.g. `http://localhost:5173`, `http://localhost:3000`). If the API is later exposed publicly, restrict to the actual frontend origin(s).
- **Auth:** The current API has no authentication. When adding authenticated or sensitive endpoints, introduce proper auth (e.g. API keys, OAuth, JWT) and document it here and in [decisions/](./decisions/).
- **Data:** SQLite (and future MSSQL) may hold user or sensitive data later; treat connection strings and credentials as secrets (config, not repo).

## Deployment

- **AWS:** GitHub Actions uses OIDC to assume an IAM role; no long-lived AWS keys in the repo. Restrict the role to least privilege (S3 + CloudFront invalidation only).
- **Secrets:** Any deployment or API secrets belong in GitHub Actions secrets or a secure config store, not in source.

## Keeping this doc useful

- When adding auth, new APIs, or new deployment targets, update this file and add an ADR in `docs/decisions/` if the choice is significant.
