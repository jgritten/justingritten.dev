import { X_TENANT_CLIENT_ID } from './tenantHeaders'

const raw = import.meta.env.VITE_API_URL
const API_BASE =
  (typeof raw === 'string' && raw.trim() !== '') ? raw.trim() : 'http://localhost:5237'

export function getApiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = getApiUrl(path)
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = getApiUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** GET with optional Bearer token (Clerk session JWT for protected API routes). */
export async function apiGetWithBearer<T>(path: string, bearerToken: string | null): Promise<T> {
  const url = getApiUrl(path)
  const headers: Record<string, string> = {}
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function apiPostWithBearer<T>(path: string, body: unknown, bearerToken: string | null): Promise<T> {
  const url = getApiUrl(path)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function apiPutWithBearer(path: string, body: unknown, bearerToken: string | null): Promise<void> {
  const url = getApiUrl(path)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
}

export async function apiPostWithBearerNoContent(path: string, bearerToken: string | null): Promise<void> {
  const url = getApiUrl(path)
  const headers: Record<string, string> = {}
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { method: 'POST', headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
}

/** GET with Bearer and tenant client id (membership must exist for that client). */
export async function apiGetWithTenant<T>(
  path: string,
  bearerToken: string | null,
  tenantClientId: string
): Promise<T> {
  const tid = tenantClientId.trim()
  if (!tid) throw new Error('Tenant client id is required for this request.')
  const url = getApiUrl(path)
  const headers: Record<string, string> = { [X_TENANT_CLIENT_ID]: tid }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** POST with JSON body, Bearer, and tenant header; parses JSON response body. */
export async function apiPostWithTenant<T>(
  path: string,
  body: unknown,
  bearerToken: string | null,
  tenantClientId: string
): Promise<T> {
  const tid = tenantClientId.trim()
  if (!tid) throw new Error('Tenant client id is required for this request.')
  const url = getApiUrl(path)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [X_TENANT_CLIENT_ID]: tid,
  }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** PATCH with JSON body, Bearer, and tenant header. */
export async function apiPatchWithTenantNoContent(
  path: string,
  body: unknown,
  bearerToken: string | null,
  tenantClientId: string
): Promise<void> {
  const tid = tenantClientId.trim()
  if (!tid) throw new Error('Tenant client id is required for this request.')
  const url = getApiUrl(path)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [X_TENANT_CLIENT_ID]: tid,
  }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
}

/** DELETE with Bearer and tenant client id (no response body). */
export async function apiDeleteWithTenantNoContent(
  path: string,
  bearerToken: string | null,
  tenantClientId: string
): Promise<void> {
  const tid = tenantClientId.trim()
  if (!tid) throw new Error('Tenant client id is required for this request.')
  const url = getApiUrl(path)
  const headers: Record<string, string> = { [X_TENANT_CLIENT_ID]: tid }
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
}
