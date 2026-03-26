import { useEffect, useRef } from 'react'
import { SITE_VERSION } from '@/utils/siteVersion'

type SiteVersionManifest = {
  version?: string
}

const CHECK_INTERVAL_MS = 60_000
const MANIFEST_PATH = '/site-version.json'

async function fetchCurrentVersion(): Promise<string | null> {
  const url = `${MANIFEST_PATH}?t=${Date.now()}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) return null
  const data = (await response.json()) as SiteVersionManifest
  return typeof data.version === 'string' ? data.version : null
}

export function SiteVersionWatcher() {
  const isReloading = useRef(false)

  useEffect(() => {
    const maybeReloadIfStale = async () => {
      if (isReloading.current) return
      try {
        const deployedVersion = await fetchCurrentVersion()
        if (deployedVersion && deployedVersion !== SITE_VERSION) {
          isReloading.current = true
          window.location.reload()
        }
      } catch {
        // Ignore transient network errors and retry on next interval.
      }
    }

    const intervalId = window.setInterval(maybeReloadIfStale, CHECK_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void maybeReloadIfStale()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    void maybeReloadIfStale()

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
