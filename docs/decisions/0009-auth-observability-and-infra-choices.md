# ADR 0009: Authentication, observability, metrics, and deferred infra

## Status

Accepted.

## Context

The roadmap calls for hosted sign-in (Phase 1), production debugging on AWS, first-party portfolio metrics, and eventually multi-instance or realtime features. Vendor pricing and portfolio economics matter: avoid recurring SaaS cost unless the value is clear.

## Decision

1. **Authentication (hosted)**  
   - **Primary:** [Clerk](https://clerk.com/) for sign-in, sessions, and JWTs (or Clerk’s session model) consumed by the React client and validated by the .NET API.  
   - **Backup:** If Clerk is dropped or unsuitable, prefer **[Supabase Auth](https://supabase.com/auth)** as the alternate hosted identity provider rather than heavier enterprise IAM for this repo.  
   - Application **users, clients (tenants), and roles** remain in the app database; the provider supplies identity only—map provider `sub` / user id to local records.

2. **Error monitoring**  
   - Do **not** adopt Sentry (or similar paid APM) for this project at current scope: the vendor’s sustainable free offering was judged insufficient versus **AWS-native structured logging** (e.g. **CloudWatch Logs** on Elastic Beanstalk, correlation/request IDs in log fields and API errors—see roadmap Phase 1A.5).  
   - Revisit only if traffic, complexity, or budget justify a paid tier.

3. **Product / visitor analytics**  
   - Stay **first-party** only: existing **`/api/metrics/...`** surface and client instrumentation (see [ADR 0008](0008-metrics-overview-period-endpoint.md)). No requirement for PostHog, GA4, or equivalent for the portfolio phase.

4. **Redis / Upstash**  
   - **Not in scope** until there is a concrete need (e.g. multi-instance API rate limiting, shared cache, SignalR scale-out). Single-instance EB + SQLite does not require it.

## Consequences

- Implementing auth means wiring **Clerk** in the client, securing **Clerk secrets** on the server / CI only, and adding **JWT (or session) validation** and claims mapping in the API—document details in `docs/security.md` when implementation lands.  
- Operational debugging relies on **log discipline** (structured fields, levels, correlation IDs) and CloudWatch—not third-party error grouping.  
- If Clerk is replaced, follow the **Supabase Auth** path in a new ADR or amendment rather than ad hoc churn.
