const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5237'

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
