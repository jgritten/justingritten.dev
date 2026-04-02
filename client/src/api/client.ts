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
