import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { Text } from '@radix-ui/themes'
import { apiGetWithBearer } from '@/api/client'
import type { MeResponse } from '@/types/me'

/**
 * Dev/demo strip: calls `GET /api/v1/me` with the Clerk session JWT when signed in.
 * Renders only when `VITE_CLERK_PUBLISHABLE_KEY` is set (parent should gate).
 */
export function SaasMeApiStatus() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setMe(null)
      setError(null)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        if (!token) {
          if (!cancelled) setError('No session token from Clerk.')
          return
        }
        const data = await apiGetWithBearer<MeResponse>('/api/v1/me', token)
        if (!cancelled) setMe(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Request failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded) return null
  if (!isSignedIn) {
    return (
      <Text as="p" size="2" color="gray">
        Sign in to verify the API session (<code className="saas-me-api-status__code">GET /api/v1/me</code>).
      </Text>
    )
  }
  if (loading) {
    return (
      <Text as="p" size="2" color="gray">
        Checking API session…
      </Text>
    )
  }
  if (error) {
    return (
      <Text as="p" size="2" color="red">
        API session check failed: {error}
      </Text>
    )
  }
  if (me) {
    return (
      <Text as="p" size="2" color="gray">
        API session OK — Clerk <code className="saas-me-api-status__code">sub</code>: {me.sub}
        {me.sessionId ? ` · session ${me.sessionId}` : ''}
      </Text>
    )
  }
  return null
}
