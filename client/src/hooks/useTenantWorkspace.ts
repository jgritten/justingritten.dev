import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useState } from 'react'
import { fetchTenantWorkspace, type TenantWorkspace } from '@/api/saasTenancy'

export type TenantWorkspaceState = {
  workspace: TenantWorkspace | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Loads `/api/v1/Tenancy/workspace` when the user is signed in with Clerk.
 * Must only be used under `ClerkProvider` (e.g. SaaS shell with publishable key).
 */
export function useTenantWorkspace(): TenantWorkspaceState {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setWorkspace(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const w = await fetchTenantWorkspace(token)
      setWorkspace(w)
    } catch (e) {
      setWorkspace(null)
      setError(e instanceof Error ? e.message : 'Could not load workspace.')
    } finally {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, getToken])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { workspace, loading, error, refresh }
}
