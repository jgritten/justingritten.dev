import { apiGet, apiPost } from './client'

export interface VisitSummary {
  route: string
  totalCount: number
}

export const metricsApi = {
  recordVisit: (route: string) =>
    apiPost<{ message: string }>('/api/metrics/visit', { route }),

  getSummary: (route = '/') =>
    apiGet<VisitSummary>(`/api/metrics/summary?route=${encodeURIComponent(route)}`),
}
