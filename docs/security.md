# Security

Security-relevant choices and practices for justingritten.dev.

## Repository and visibility

- The repo is **public** by design (portfolio, shareable with employers). Assume no secrets in the codebase.

## Frontend

- **No secrets in client code:** Do not put API keys or secrets in `client/` or in env vars that are baked into the build (e.g. `VITE_*`). These are visible in the built bundle.
- **API URL:** `VITE_API_URL` is for pointing at an API base (e.g. localhost or a future public API). It is not a secret.

### Contact form (API + SQLite)

The profile contact form **POST**s to the API (`/api/contact`). Submissions are stored in SQLite (`ContactMessages`) and a short summary is logged server-side.

- **Anti-spam and abuse (client):** Honeypot field (`website`), validation, length limits, and a post-submit cooldown (see `ContactCard.tsx`). **Server:** validation and length limits in `ContactController`; consider rate limiting by IP and/or email and optional CAPTCHA for stronger bot protection.
- **Reading submissions:** Operators use **AWS-controlled access** (e.g. Session Manager, SSH, or a local copy of the DB file)—see **Operator access: SSH and the SQLite database** in [deployment.md](./deployment.md). Do not rely on publishing connection details or keys in this repo.
- **`GET /api/contact`:** The API currently exposes a **recent-messages JSON list without authentication**. Treat that as sensitive until you add auth, remove the endpoint, or restrict it another way (e.g. not routable publicly). Document changes here when you adjust it.

## Backend (API)

- **CORS:** The API allows specific origins (e.g. `http://localhost:5173`, `http://localhost:3000`). If the API is later exposed publicly, restrict to the actual frontend origin(s).
- **Auth:** The current API has no authentication. When adding authenticated or sensitive endpoints, introduce proper auth (e.g. API keys, OAuth, JWT) and document it here and in [decisions/](./decisions/).
- **Data:** SQLite (and future MSSQL) may hold user or sensitive data later; treat connection strings and credentials as secrets (config, not repo).
- **Consistent error contracts:** Keep one standard error response shape across endpoints so different frontends (web/mobile) can handle failures consistently.
- **Rate limiting:** Add and tune endpoint-level rate limits (especially write endpoints) to protect shared public APIs from abuse and accidental client retry storms.
- **Request tracing:** Include request/correlation IDs in logs and error responses where appropriate to support debugging across clients.

## Deployment

- **AWS:** GitHub Actions uses OIDC to assume an IAM role; no long-lived AWS keys in the repo. Restrict the role to least privilege (S3 + CloudFront invalidation only).
- **Secrets:** Any deployment or API secrets belong in GitHub Actions secrets or a secure config store, not in source.

## Keeping this doc useful

- When adding auth, new APIs, or new deployment targets, update this file and add an ADR in `docs/decisions/` if the choice is significant.
