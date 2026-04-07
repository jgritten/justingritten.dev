import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getApiUrl,
  apiGet,
  apiGetWithBearer,
  apiGetWithTenant,
  apiDeleteWithTenantNoContent,
  apiPostWithBearer,
  apiPutWithBearer,
  apiPostWithBearerNoContent,
} from './client'
import { X_TENANT_CLIENT_ID } from './tenantHeaders'

// Base URL is set in vitest.config env (VITE_API_URL); API_BASE is read at module load.
describe('getApiUrl', () => {
  it('appends path with leading slash to base URL', () => {
    expect(getApiUrl('/api/products')).toBe('http://localhost:5237/api/products')
  })

  it('adds leading slash when path has none', () => {
    expect(getApiUrl('api/products')).toBe('http://localhost:5237/api/products')
  })
})

describe('apiGet', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns JSON when response is ok', async () => {
    const data = [{ id: 1, name: 'Test' }]
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const result = await apiGet<typeof data>('/api/products')
    expect(result).toEqual(data)
  })

  it('throws with status and body when response is not ok', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Product not found'),
    })
    await expect(apiGet('/api/products')).rejects.toThrow(
      'API 404: Product not found'
    )
  })
})

describe('apiGetWithBearer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends Authorization header when token is provided', async () => {
    const data = { sub: 'user_1', sessionId: null, issuer: null }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const result = await apiGetWithBearer<typeof data>('/api/v1/me', 'test-jwt')
    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-jwt' },
      })
    )
  })

  it('omits Authorization when token is null', async () => {
    const data = { sub: 'x', sessionId: null, issuer: null }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })
    await apiGetWithBearer<typeof data>('/api/v1/me', null)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/me',
      expect.objectContaining({
        headers: {},
      })
    )
  })
})

describe('apiGetWithTenant', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends X-Tenant-Client-Id and optional Authorization', async () => {
    const data = { members: [{ membershipId: 'm1' }], pendingInvitations: [] }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const result = await apiGetWithTenant<typeof data>(
      '/api/v1/Tenancy/clients/members',
      'tok',
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    )
    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/Tenancy/clients/members',
      expect.objectContaining({
        headers: {
          [X_TENANT_CLIENT_ID]: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          Authorization: 'Bearer tok',
        },
      })
    )
  })
})

describe('apiDeleteWithTenantNoContent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends DELETE with tenant header and Authorization', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    })
    await apiDeleteWithTenantNoContent(
      '/api/v1/Tenancy/clients/invitations/11111111-1111-1111-1111-111111111111',
      'jwt',
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    )
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/Tenancy/clients/invitations/11111111-1111-1111-1111-111111111111',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          [X_TENANT_CLIENT_ID]: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          Authorization: 'Bearer jwt',
        },
      })
    )
  })
})

describe('apiPostWithBearer and apiPutWithBearer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('apiPostWithBearer sends JSON body and Authorization', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('{"clientId":"a","name":"Acme"}'),
    })
    const result = await apiPostWithBearer<{ clientId: string; name: string }>(
      '/api/v1/Tenancy/clients',
      { name: 'Acme' },
      'jwt'
    )
    expect(result).toEqual({ clientId: 'a', name: 'Acme' })
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/Tenancy/clients',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt',
        },
        body: JSON.stringify({ name: 'Acme' }),
      })
    )
  })

  it('apiPutWithBearer sends JSON and resolves on 204', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    })
    await apiPutWithBearer(
      '/api/v1/Tenancy/preferences',
      { defaultClientId: null, skipHubWhenDefaultAvailable: false },
      'jwt'
    )
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/Tenancy/preferences',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt',
        },
      })
    )
  })

  it('apiPostWithBearerNoContent POSTs without body', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(''),
    })
    await apiPostWithBearerNoContent('/api/v1/Tenancy/invitations/x/accept', 'jwt')
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5237/api/v1/Tenancy/invitations/x/accept',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer jwt' },
      })
    )
  })
})
