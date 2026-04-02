# ADR 0011: Multi-tenant clients, workspace hub API, and post-sign-in UX

## Status

Accepted.

## Context

The SaaS demo uses **Clerk** for identity ([ADR 0010](0010-clerk-saas-authentication.md)) but still needs **first-class tenants** (“clients”), **memberships**, **invitations**, and a **post-sign-in hub** so users are not dropped straight onto a dashboard without choosing or creating a workspace. The roadmap ([roadmap.md](../roadmap.md) Phase 2) calls for hub-first UX, an optional **default client**, and **no mandatory auto-redirect** when the user has only one membership unless they opt in via preferences.

## Decision

1. **Identity linkage**  
   - The API continues to trust **Clerk session JWTs** (`sub` = Clerk user id).  
   - **No duplicate password store** in this slice: `TenantMembership.ClerkUserId` and `TenantUserPreference.ClerkUserId` store the Clerk **`sub`** string (max 128 chars).  
   - **Invitations** are addressed by **normalized email** (`InviteeEmailNormalized`, lowercase trim). Pending invites are listed when the JWT includes a matching **`email`** claim (standard claim or `ClaimTypes.Email`).

2. **Data model (SQLite / EF Core)**  
   - **`TenantClient`**: tenant record (`Name`, `CreatedAtUtc`, `IsDeleted`).  
   - **`TenantMembership`**: `(ClerkUserId, TenantClientId)` unique; `Role` string using **`TenantRoles`** constants (`Owner`, `Admin`, `User`).  
   - **`TenantInvitation`**: pending/accepted/declined; ties invitee email to a client and optional metadata (see **Client roles** below).  
   - **`TenantUserPreference`**: per-Clerk-user **`DefaultTenantClientId`** (nullable) and **`SkipHubWhenDefaultAvailable`** (bool). Default client must be a membership of that user when saved.  
   - **One Owner per client (strict):** a filtered unique index on `TenantClientId` where `Role = 'Owner'` enforces at most one Owner row per tenant. Ownership transfer = transactional demote/promote (future endpoint), not a second Owner insert.

**Client roles (initial, portfolio demo)**  
   - **`Owner`**: exactly **one** per `TenantClient` — the user who **creates** the client (`POST clients`) until **ownership is transferred** (future flow). Owner is the role that may **delete the tenant** (or transfer ownership) once those endpoints exist; other destructive org rules TBD.  
   - **`Admin`**: **zero or more** per client — delegated administrators (promotion/invite flows not built yet). Permissions vs Owner are product-defined (e.g. Admins might manage users but not delete the org).  
   - **`User`**: assigned to every **accepted invitation** for now (`TenantInvitation.Role` is not used to elevate invitees); ordinary member.  
   - Finer permissions and **Admin** assignment are deferred; enforce **membership + role** on sensitive routes when they are added.

3. **API surface (`/api/v1/Tenancy/*`, all `[Authorize]` with Clerk JWT)**  
   - `GET workspace` — memberships (active clients), pending invitations for the user’s email, and preferences.  
   - `POST clients` — create `TenantClient` + **`Owner`** membership for `sub`.  
   - `PUT preferences` — update default client + skip-hub flag (validated against memberships).  
   - `POST invitations/{id}/accept` / `decline` — email must match invitation; accept creates a **`User`** membership when not already a member.

4. **Client (`/saas/post-sign-in`)**  
   - Loads **`GET /api/v1/Tenancy/workspace`** with the Clerk session token.  
   - Renders **invitations**, **memberships**, **Create client** (modal wizard calling `POST clients`).  
   - If **`skipHubWhenDefaultAvailable`** is true and **default** is set and still a valid membership, redirects once to **`/saas/dashboard`** with **`SaasClientContext`** set to that client.  
   - On API failure, offers **retry** and **Continue to dashboard (demo)** using the prior Clerk-user placeholder client context.

## Consequences

- **Email in JWT:** Invitation matching requires the Clerk session template to include **email** in the session token (or equivalent claim). If missing, invitations stay empty until templates are adjusted.  
- **Migrations:** Production SQLite on EB receives new tables via EF migrations on deploy (`Program.cs` runs `Migrate()`).  
- **Authorization:** Tenant-scoped **resource** authorization (e.g. per-client row checks on future matter/doc endpoints) is **not** implemented in this ADR—only authenticated access to tenancy **management** routes. Follow-up work should enforce `TenantClientId` on all tenant data, validate membership on every request, and gate **delete client** / **transfer ownership** on **`Owner`** (and define what **`Admin`** may do vs Owner).

## References

- [ADR 0010: Clerk SaaS authentication](0010-clerk-saas-authentication.md)  
- [Roadmap Phase 2](../roadmap.md)
