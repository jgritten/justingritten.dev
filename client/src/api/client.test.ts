import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getApiUrl, apiGet, apiGetWithBearer } from './client'

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
