# ADR 0010: Clerk authentication for SaaS routes and API JWT validation

## Status

Accepted.

## Context

The roadmap and [ADR 0009](0009-auth-observability-and-infra-choices.md) lock **Clerk** as the primary hosted identity provider for the SaaS demo. The portfolio shell (`/`, `/build`) stays unauthenticated; only the **`/saas`** subtree and selected API routes use Clerk session JWTs.

## Decision

1. **Client (`/saas`)**  
   - Wrap SaaS routes with **`ClerkProvider`** from `@clerk/react` when `VITE_CLERK_PUBLISHABLE_KEY` is set.  
   - **`SaasEntry`** embeds Clerk `<SignIn />` or offers **Continue as Guest** (placeholder `guest-client` in `SaasClientContext`).  
   - After Clerk sign-in, **`/saas/post-sign-in`** is the forced redirect target (not the dashboard): it loads the **tenancy workspace** from **`/api/v1/Tenancy/workspace`** and drives **`SaasClientContext`** from the chosen or created client ([ADR 0011](0011-multi-tenant-clients-and-workspace-hub.md)); with API errors it can fall back to a demo **Continue to dashboard** path.  
   - **`SaasAppShell`** passes **`UserButton`** into **`MenuBar`** via an optional `userMenu` slot when Clerk is configured.

2. **API**  
   - **`Microsoft.AspNetCore.Authentication.JwtBearer`** validates Clerk **session tokens** (Bearer).  
   - **`CLERK_FRONTEND_API`** — Clerk **Frontend API** base URL (must match JWT **`iss`**), e.g. `https://your-instance.clerk.accounts.dev` or `https://clerk.your-domain.com`. Used as JWT authority/issuer.  
   - **`CLERK_METADATA_ADDRESS`** (optional) — override for OIDC discovery if the default `{CLERK_FRONTEND_API}/.well-known/openid-configuration` is wrong for your instance.  
   - **`CLERK_AUTHORIZED_PARTIES`** (optional, comma-separated) — if set, the handler rejects tokens whose **`azp`** claim is not in this list (recommended for production; values are full origins, e.g. `http://localhost:5173,https://www.justingritten.dev,https://justingritten.dev`).  
   - When **`CLERK_FRONTEND_API`** is unset, JWT validation is configured to **reject all signatures** so `[Authorize]` still returns **401** in CI and local runs without Clerk secrets.

3. **First protected surface**  
   - **`GET /api/v1/me`** returns **`sub`**, **`sid`** (session id), and **`iss`** from validated claims — no local user table yet.

## Consequences

- Elastic Beanstalk (and local user secrets) must define **`CLERK_FRONTEND_API`** for real JWT validation in deployed environments.  
- If token validation fails at runtime (e.g. metadata fetch), verify Clerk’s **Frontend API** URL and OIDC discovery; use **`CLERK_METADATA_ADDRESS`** only when Clerk documents a different discovery URL.  
- **JWKS-only** without OIDC discovery is not implemented here; add a follow-up ADR if needed.  
- Clerk increases the client bundle size; optional future work: lazy-load Clerk only on `/saas`.

## References

- [Clerk: Session tokens](https://clerk.com/docs/guides/sessions/session-tokens)  
- [Clerk: Manual JWT verification](https://clerk.com/docs/backend-requests/manual-jwt)
