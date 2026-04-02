import {
  apiGetWithBearer,
  apiPostWithBearer,
  apiPostWithBearerNoContent,
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
}

export type TenantPreferences = {
  defaultClientId: string | null
  skipHubWhenDefaultAvailable: boolean
}

export type TenantWorkspace = {
  memberships: TenantMembership[]
  invitations: TenantInvitation[]
  preferences: TenantPreferences
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
