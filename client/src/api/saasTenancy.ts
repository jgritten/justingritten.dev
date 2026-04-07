import {
  apiDeleteWithTenantNoContent,
  apiGetWithBearer,
  apiGetWithTenant,
  apiPatchWithTenantNoContent,
  apiPostWithBearer,
  apiPostWithBearerNoContent,
  apiPostWithTenant,
  apiPutWithBearer,
} from './client'

export type TenantMembership = {
  clientId: string
  name: string
  role: string
}

export type TenantInvitation = {
  id: string
  clientId: string
  clientName: string
  inviteeEmail: string
  role: string
  status: string
  /** True for the seeded Northwinds Demo tenant (pre-filled demo workspace). */
  isDemoWorkspace?: boolean
}

export type TenantPreferences = {
  defaultClientId: string | null
  skipHubWhenDefaultAvailable: boolean
}

export type TenantWorkspace = {
  memberships: TenantMembership[]
  invitations: TenantInvitation[]
  preferences: TenantPreferences
  /** False if the API could not read an email from the Clerk session JWT (no invitation list / Northwinds auto-invite). */
  hasEmailClaim: boolean
}

export type CreateTenantClientResponse = {
  clientId: string
  name: string
}

export async function fetchTenantWorkspace(token: string | null): Promise<TenantWorkspace> {
  return apiGetWithBearer<TenantWorkspace>('/api/v1/Tenancy/workspace', token)
}

export async function createTenantClient(
  token: string | null,
  name: string
): Promise<CreateTenantClientResponse> {
  return apiPostWithBearer<CreateTenantClientResponse>(
    '/api/v1/Tenancy/clients',
    { name },
    token
  ) as Promise<CreateTenantClientResponse>
}

export async function updateTenantPreferences(
  token: string | null,
  body: TenantPreferences
): Promise<void> {
  await apiPutWithBearer(
    '/api/v1/Tenancy/preferences',
    {
      defaultClientId: body.defaultClientId,
      skipHubWhenDefaultAvailable: body.skipHubWhenDefaultAvailable,
    },
    token
  )
}

export async function acceptTenantInvitation(
  token: string | null,
  invitationId: string
): Promise<void> {
  await apiPostWithBearerNoContent(`/api/v1/Tenancy/invitations/${invitationId}/accept`, token)
}

export async function declineTenantInvitation(
  token: string | null,
  invitationId: string
): Promise<void> {
  await apiPostWithBearerNoContent(`/api/v1/Tenancy/invitations/${invitationId}/decline`, token)
}

export type TenantClientMemberDto = {
  membershipId: string
  clerkUserId: string
  /** Roster email when known (owner session or accepted invite); otherwise omit/null. */
  email?: string | null
  role: string
  createdAtUtc: string
  isCurrentUser: boolean
}

export type TenantPendingInvitationDto = {
  invitationId: string
  inviteeEmail: string
  role: string
  /** Display status for the Users table (e.g. "Invited"). */
  status: string
}

export type TenantClientRosterDto = {
  members: TenantClientMemberDto[]
  pendingInvitations: TenantPendingInvitationDto[]
}

export async function fetchTenantClientRoster(
  token: string | null,
  tenantClientId: string
): Promise<TenantClientRosterDto> {
  return apiGetWithTenant<TenantClientRosterDto>(
    '/api/v1/Tenancy/clients/members',
    token,
    tenantClientId
  )
}

/** Updates a member’s client role (Admin or User only). Caller must be Owner or Admin of the tenant. */
export type CreateTenantInvitationResponse = {
  invitationId: string
  inviteeEmail: string
  role: string
}

/** Creates a pending invitation (Admin or User role). Caller must be Owner or Admin. */
export async function createTenantInvitation(
  token: string | null,
  tenantClientId: string,
  inviteeEmail: string,
  role: 'Admin' | 'User'
): Promise<CreateTenantInvitationResponse> {
  return apiPostWithTenant<CreateTenantInvitationResponse>(
    '/api/v1/Tenancy/clients/invitations',
    { inviteeEmail, role },
    token,
    tenantClientId
  )
}

export async function patchTenantMemberRole(
  token: string | null,
  tenantClientId: string,
  membershipId: string,
  role: 'Admin' | 'User'
): Promise<void> {
  await apiPatchWithTenantNoContent(
    `/api/v1/Tenancy/clients/members/${membershipId}`,
    { role },
    token,
    tenantClientId
  )
}

/** Removes a pending invitation. Caller must be Owner or Admin on the tenant client. */
export async function deleteTenantPendingInvitation(
  token: string | null,
  tenantClientId: string,
  invitationId: string
): Promise<void> {
  const id = invitationId.trim()
  if (!id) throw new Error('Invitation id is required.')
  await apiDeleteWithTenantNoContent(
    `/api/v1/Tenancy/clients/invitations/${encodeURIComponent(id)}`,
    token,
    tenantClientId
  )
}
