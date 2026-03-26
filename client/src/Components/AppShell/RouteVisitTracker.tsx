import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { metricsApi } from '@/api'

function normalizeRoute(pathname: string): string {
  if (!pathname) return '/'
  if (pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export function RouteVisitTracker() {
  const location = useLocation()
  const lastRecorded = useRef<string | null>(null)

  useEffect(() => {
    const route = normalizeRoute(location.pathname)
    if (lastRecorded.current === route) return
    lastRecorded.current = route
    metricsApi.recordVisit(route).catch(() => {})
  }, [location.pathname])

  return null
}
