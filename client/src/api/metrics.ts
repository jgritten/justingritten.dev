import { apiGet, apiPost } from './client'

export interface VisitSummary {
  route: string
  totalCount: number
}

export interface MetricRouteTotal {
  route: string
  totalCount: number
}

export interface MetricBucketTotal {
  bucketStartUtc: string
  totalCount: number
}

export interface MetricBucketRouteTotal {
  bucketStartUtc: string
  route: string
  totalCount: number
}

export interface MetricsOverview {
  period: 'hour' | 'day' | 'week' | 'month'
  fromUtc: string
  toUtc: string
  routeTotals: MetricRouteTotal[]
  outboundTotals: MetricRouteTotal[]
  bucketTotals: MetricBucketTotal[]
  routeBucketTotals: MetricBucketRouteTotal[]
}

export const metricsApi = {
  recordVisit: (route: string) =>
    apiPost<{ message: string }>('/api/metrics/visit', { route }),

  getSummary: (route = '/') =>
    apiGet<VisitSummary>(`/api/metrics/summary?route=${encodeURIComponent(route)}`),

  getOverview: (period: MetricsOverview['period']) =>
    apiGet<MetricsOverview>(`/api/metrics/overview?period=${encodeURIComponent(period)}`),
}
