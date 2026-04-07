# ADR 0014: Revoke pending tenant invitations (Owner / Admin)

## Status

Accepted

## Context

Admins and Owners can create pending invitations that send email via Resend. If the invitee email was mistyped or the wrong person was invited, there must be a way to **remove the pending row** so the team can correct the mistake and optionally invite the right address. Invitees already have **decline** on their side; this capability is **admin-side cancellation** scoped to the active tenant client.

## Decision

- Add **`DELETE /api/v1/Tenancy/clients/invitations/{invitationId}`** with the same **`X-Tenant-Client-Id`** header as other client-scoped tenancy routes.
- Allow the operation only when the caller’s membership role on that client is **Owner** or **Admin** (same bar as creating invitations and patching member roles).
- On success, **delete** the `TenantInvitation` row when it is **Pending** and belongs to that client (reuse `DeletePendingInvitationAsync`). **404** when the id is missing, not pending, or not for that client; **403** when the caller is not Owner/Admin or not a member.

## Consequences

- The Users settings table can expose **Revoke invite** for `Invited` rows without a separate “pending invitations” screen.
- Removing the row clears the pending unique index for that tenant+email so a corrected invite can be created.
- No email is sent to the invitee on revoke (out of scope); the wrong address may still have received the original message.

## Related

- [ADR 0013](0013-x-tenant-client-id-and-members-api.md) — `X-Tenant-Client-Id` and member APIs
- [ADR 0011](0011-multi-tenant-clients-and-workspace-hub.md) — tenancy model
