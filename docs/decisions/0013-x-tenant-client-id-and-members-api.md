# ADR 0013: `X-Tenant-Client-Id` and tenant member APIs

## Status

Accepted

## Context

The SaaS SPA selects an active **tenant client** in the shell (`SaasClientContext`) while the signed-in user is identified by the **Clerk JWT**. Listing or mutating users for a client must:

1. Apply to exactly one tenant (no ambiguous “current client” inferred only from JWT).
2. Reject callers who are not members of that client.
3. Restrict sensitive mutations (e.g. role changes) to **Owner** and **Admin**.

Workspace and preferences endpoints already use the JWT subject; they do not need a tenant header because they either aggregate all memberships or validate default client ids server-side.

## Decision

- Introduce a custom request header **`X-Tenant-Client-Id`** (GUID string) on tenant-scoped tenancy routes, aligned with `Api.Http.TenantHttpHeaders.TenantClientId` on the server and `X_TENANT_CLIENT_ID` on the client.
- Add **`GET /api/v1/Tenancy/clients/members`**: returns membership rows (`membershipId`, `clerkUserId`, `role`, `createdAtUtc`, `isCurrentUser`) when the JWT subject has a membership for that client; otherwise **403**.
- Add **`PATCH /api/v1/Tenancy/clients/members/{membershipId}`** with body `{ "role": "Admin" | "User" }` when the header matches the membership’s client: allowed only for callers whose role is **Owner** or **Admin**; **Owner** memberships cannot be changed through this endpoint (ownership transfer remains a future flow).

## Consequences

- The SPA must send **`X-Tenant-Client-Id`** for these calls (see `client/src/api/client.ts` helpers and `saasTenancy.ts`).
- CORS already allows custom headers via `AllowAnyHeader`.
- Profile fields (name, email) are not stored on `TenantMembership`; the UI labels tenant rows as **Account** and explains Clerk owns profile data until a separate sync or admin API exists.
- Demo/sample users in the Settings UI remain client-side only and are visually distinct from database-backed rows.

## Related

- [ADR 0011](0011-multi-tenant-clients-and-workspace-hub.md) — tenancy model
- [ADR 0010](0010-clerk-saas-authentication.md) — Clerk JWT
- [ADR 0014](0014-revoke-pending-tenant-invitation.md) — revoke pending invitations (same header and Owner/Admin bar)
