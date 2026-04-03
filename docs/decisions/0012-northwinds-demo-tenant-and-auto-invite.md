# ADR 0012: Northwinds Demo tenant and lazy auto-invite

## Status

Accepted.

## Context

The SaaS demo needs a **shared, pre-seeded workspace** so visitors can explore realistic data without creating and populating a tenant themselves. The post-sign-in hub already supports **pending invitations** and **Create client** ([ADR 0011](0011-multi-tenant-clients-and-workspace-hub.md)). We want every new signed-in user (with an email claim) to see **one pending invite** to that demo tenant, while still allowing **decline** and **create own client**.

## Decision

1. **Seeded tenant**  
   - A single `TenantClient` row **`Northwinds Demo`** is inserted via EF migration with a **stable `Guid`** (`NorthwindsDemoTenant.ClientId` in code).  
   - No Owner membership is required for the portfolio slice (the one-Owner-per-tenant index allows zero owners). Optional future ops: set `CLERK_SAAS_DEMO_OWNER_USER_ID` (or similar) in environment and add an Owner membership for a real Clerk user if admin or seed scripts need an authenticated Owner.

2. **Lazy invite on workspace load**  
   - On **`GET /api/v1/Tenancy/workspace`**, after resolving the normalized email from the JWT, the API **ensures** a `TenantInvitation` exists for **`(NorthwindsDemoTenant.ClientId, email)`** unless:
     - the user is **already a member** of that tenant, or  
     - **any** invitation row already exists for that pair (any status), so **decline** does not cause a new invite on the next load.  
   - Invitations are still listed only when **Pending**; accept/decline behavior is unchanged.

3. **Concurrency and duplicates**  
   - A **filtered unique index** on `(TenantClientId, InviteeEmailNormalized)` where `Status = Pending` prevents two pending rows for the same tenant+email under parallel requests. **`DbUpdateException`** on insert is swallowed in the service so the caller still gets a consistent workspace response.

4. **API / UI**  
   - `TenantInvitationResponseDto` includes **`IsDemoWorkspace`** when `TenantClientId` is the Northwinds id so the client can explain the invite without hardcoding Guids.

5. **Domain data**  
   - **Out of scope here:** attaching business entities (e.g. products, matters) to `TenantClientId` and seeding Northwinds-specific rows. That is a follow-up once models are tenant-scoped.

## Consequences

- **Email in the session JWT** remains mandatory: Clerk’s **default** session token does **not** include primary email; add it under **Sessions → Customize session token** (see `docs/development.md`). The API accepts several claim names (`email`, `primaryEmail`, `primary_email_address`, etc.) via `ClerkSessionEmailClaims`.
- **`HasEmailClaim`** on `GET workspace` lets the UI explain when the token had no usable email (same as manual invitations in ADR 0011 when the claim is missing).  
- **Clerk `user.created` webhook** is not required; first hub load is sufficient for the demo. A webhook could call shared “ensure invite” logic later if desired.  
- **Migrations** must run in all environments so the seeded tenant exists before invites reference it.

## References

- [ADR 0011: Multi-tenant clients and workspace hub](0011-multi-tenant-clients-and-workspace-hub.md)  
- [ADR 0010: Clerk SaaS authentication](0010-clerk-saas-authentication.md)
