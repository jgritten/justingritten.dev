import { useEffect, useMemo, useState } from 'react'
import { Heading, Text } from '@radix-ui/themes'
import { metricsApi } from '@/api'
import { useRecentCommits } from '@/hooks'
import { formatRelativeTime } from '@/utils/relativeTime'
import './RecentActivityWidget.css'

const DEFAULT_COMMIT_LIMIT = 5
const CHART_WIDTH = 640
const CHART_HEIGHT = 220
const CHART_PADDING_X = 12
const CHART_PADDING_TOP = 10
const CHART_PADDING_BOTTOM = 20

type TimeframeKey = 'hour' | 'day' | 'week' | 'month'
type ChartPoint = { x: number; y: number }
type MetricKey = 'visits' | 'deployments'

interface RouteConfig {
  key: string
  label: string
  route: string
}

const ROUTE_COVERAGE_CONFIG: RouteConfig[] = [
  { key: 'home', label: '/', route: '/' },
  { key: 'build', label: '/build', route: '/build' },
  { key: 'saas-entry', label: '/saas', route: '/saas' },
  { key: 'saas-dashboard', label: '/saas/dashboard', route: '/saas/dashboard' },
  { key: 'saas-settings', label: '/saas/settings', route: '/saas/settings' },
  { key: 'saas-settings-account', label: '/saas/settings/account', route: '/saas/settings/account' },
  { key: 'saas-settings-application', label: '/saas/settings/application', route: '/saas/settings/application' },
  { key: 'saas-settings-client', label: '/saas/settings/client', route: '/saas/settings/client' },
  { key: 'saas-settings-users', label: '/saas/settings/users', route: '/saas/settings/users' },
]

const OUTBOUND_METRIC_CONFIG: RouteConfig[] = [
  { key: 'outbound-resume', label: 'Resume', route: '/outbound/resume' },
  { key: 'outbound-linkedin', label: 'LinkedIn', route: '/outbound/linkedin' },
  { key: 'outbound-email', label: 'Email', route: '/outbound/email' },
]

const TIMEFRAME_CONFIG: Array<{ key: TimeframeKey; label: string; buckets: number; bucketMs: number }> = [
  { key: 'hour', label: 'Hour', buckets: 12, bucketMs: 5 * 60 * 1000 },
  { key: 'day', label: 'Day', buckets: 24, bucketMs: 60 * 60 * 1000 },
  { key: 'week', label: 'Week', buckets: 7, bucketMs: 24 * 60 * 60 * 1000 },
  { key: 'month', label: 'Month', buckets: 30, bucketMs: 24 * 60 * 60 * 1000 },
]

function createPoints(values: number[], maxValue: number): ChartPoint[] {
  const width = CHART_WIDTH - CHART_PADDING_X * 2
  const height = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM
  const stepX = values.length > 1 ? width / (values.length - 1) : 0

  return values.map((value, index) => {
    const x = CHART_PADDING_X + index * stepX
    const normalized = maxValue > 0 ? value / maxValue : 0
    const y = CHART_PADDING_TOP + (1 - normalized) * height
    return { x, y }
  })
}

function createAreaPath(points: ChartPoint[]): string {
  if (points.length === 0) return ''

  const top = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const baselineY = CHART_HEIGHT - CHART_PADDING_BOTTOM
  const last = points[points.length - 1]
  const first = points[0]

  return `${top} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`
}

function getBucketLabel(index: number, timeframe: TimeframeKey, totalBuckets: number): string {
  const ago = totalBuckets - 1 - index
  if (ago === 0) return 'Now'
  if (timeframe === 'hour') return `${ago * 5}m ago`
  if (timeframe === 'day') return `${ago}h ago`
  return `${ago}d ago`
}

function normalizeBucketKey(bucketStartUtc: string): string {
  const timestamp = new Date(bucketStartUtc).getTime()
  if (Number.isNaN(timestamp)) return bucketStartUtc
  return new Date(timestamp).toISOString()
}

function buildExpectedBucketStarts(fromUtc: string, timeframe: TimeframeKey): string[] {
  const config = TIMEFRAME_CONFIG.find((item) => item.key === timeframe) ?? TIMEFRAME_CONFIG[2]
  const fromTimestamp = new Date(fromUtc).getTime()
  if (Number.isNaN(fromTimestamp)) return []
  return Array.from({ length: config.buckets }, (_, index) =>
    new Date(fromTimestamp + index * config.bucketMs).toISOString(),
  )
}

function bucketDeploymentsByTimeframe(
  commits: Array<{ date: string }>,
  timeframe: TimeframeKey,
): number[] {
  const config = TIMEFRAME_CONFIG.find((item) => item.key === timeframe) ?? TIMEFRAME_CONFIG[2]
  const deployments = Array.from({ length: config.buckets }, () => 0)
  const now = Date.now()
  const windowStart = now - config.buckets * config.bucketMs

  for (const commit of commits) {
    const timestamp = new Date(commit.date).getTime()
    if (Number.isNaN(timestamp) || timestamp < windowStart || timestamp > now) continue
    const diff = now - timestamp
    const indexFromEnd = Math.floor(diff / config.bucketMs)
    const index = config.buckets - 1 - indexFromEnd
    if (index >= 0 && index < deployments.length) deployments[index] += 1
  }

  return deployments
}

function getBucketIndexFromTimestamp(
  timestamp: number,
  timeframe: TimeframeKey,
  now: number,
): number | null {
  const config = TIMEFRAME_CONFIG.find((item) => item.key === timeframe) ?? TIMEFRAME_CONFIG[2]
  const windowStart = now - config.buckets * config.bucketMs
  if (Number.isNaN(timestamp) || timestamp < windowStart || timestamp > now) return null
  const diff = now - timestamp
  const indexFromEnd = Math.floor(diff / config.bucketMs)
  const index = config.buckets - 1 - indexFromEnd
  return index >= 0 && index < config.buckets ? index : null
}

function buildVisitSeriesFromBucketTotals(
  bucketTotals: Array<{ bucketStartUtc: string; totalCount: number }>,
  timeframe: TimeframeKey,
): number[] {
  const config = TIMEFRAME_CONFIG.find((item) => item.key === timeframe) ?? TIMEFRAME_CONFIG[2]
  const visits = Array.from({ length: config.buckets }, () => 0)
  const sorted = [...bucketTotals].sort(
    (a, b) => new Date(a.bucketStartUtc).getTime() - new Date(b.bucketStartUtc).getTime(),
  )
  const startIndex = Math.max(0, sorted.length - config.buckets)
  const aligned = sorted.slice(startIndex)
  aligned.forEach((bucket, idx) => {
    visits[idx + (config.buckets - aligned.length)] = bucket.totalCount
  })
  return visits
}

export function RecentActivityWidget() {
  const [timeframe, setTimeframe] = useState<TimeframeKey>('week')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricKey, boolean>>({
    visits: true,
    deployments: true,
  })
  const [routeBucketVisitsByStart, setRouteBucketVisitsByStart] = useState<Record<string, Record<string, number>>>({})
  const [visitBucketTotals, setVisitBucketTotals] = useState<Array<{ bucketStartUtc: string; totalCount: number }>>([])
  const [outboundClicks, setOutboundClicks] = useState<Record<string, number>>({})
  const { commits, isLoading, error } = useRecentCommits()
  const displayCommits = commits.slice(0, DEFAULT_COMMIT_LIMIT)
  const chartSeries = useMemo(() => {
    const deployments = bucketDeploymentsByTimeframe(commits, timeframe)
    const visits = buildVisitSeriesFromBucketTotals(visitBucketTotals, timeframe)
    return { deployments, visits }
  }, [commits, timeframe, visitBucketTotals])

  const maxValue = Math.max(
    1,
    ...(visibleMetrics.visits ? chartSeries.visits : [0]),
    ...(visibleMetrics.deployments ? chartSeries.deployments : [0]),
  )
  const visitsPoints = createPoints(chartSeries.visits, maxValue)
  const deploymentsPoints = createPoints(chartSeries.deployments, maxValue)
  const visitsPath = createAreaPath(visitsPoints)
  const deploymentsPath = createAreaPath(deploymentsPoints)
  const activeIndex = hoveredIndex ?? Math.max(0, chartSeries.visits.length - 1)
  const activeVisits = chartSeries.visits[activeIndex] ?? 0
  const activeDeployments = chartSeries.deployments[activeIndex] ?? 0
  const activeLabel = getBucketLabel(activeIndex, timeframe, chartSeries.visits.length)
  const xAxisLabelIndexes = Array.from(
    new Set([0, Math.floor((chartSeries.visits.length - 1) / 2), chartSeries.visits.length - 1]),
  ).filter((i) => i >= 0)
  const hasVisibleMetric = visibleMetrics.visits || visibleMetrics.deployments
  const activeBucketStart = visitBucketTotals[activeIndex]?.bucketStartUtc
  const hoveredRouteCounts = activeBucketStart ? routeBucketVisitsByStart[activeBucketStart] : undefined
  const zeroRouteVisits = useMemo(
    () => Object.fromEntries(ROUTE_COVERAGE_CONFIG.map((routeConfig) => [routeConfig.key, 0])),
    [],
  )
  const displayedRouteVisits = hoveredRouteCounts ?? zeroRouteVisits
  const maxRouteVisits = Math.max(1, ...Object.values(displayedRouteVisits))
  const scopedDeployments = useMemo(() => {
    const now = Date.now()
    return commits
      .filter((commit) => {
        const timestamp = new Date(commit.date).getTime()
        const bucketIndex = getBucketIndexFromTimestamp(timestamp, timeframe, now)
        return bucketIndex === activeIndex
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [activeIndex, commits, timeframe])
  const deploymentRows = useMemo(
    () =>
      scopedDeployments.length >= 5
        ? scopedDeployments
        : [...scopedDeployments, ...Array.from({ length: 5 - scopedDeployments.length }, () => null)],
    [scopedDeployments],
  )

  useEffect(() => {
    let cancelled = false

    metricsApi
      .getOverview(timeframe)
      .then((overview) => {
        if (cancelled) return
        const outboundByPath = new Map(overview.outboundTotals.map((item) => [item.route, item.totalCount]))
        const routeBucketsByStart: Record<string, Record<string, number>> = {}
        const expectedBucketStarts = buildExpectedBucketStarts(overview.fromUtc, timeframe)
        const bucketTotalsByStart = new Map(
          overview.bucketTotals.map((bucket) => [normalizeBucketKey(bucket.bucketStartUtc), bucket.totalCount]),
        )
        const normalizedBuckets = (
          expectedBucketStarts.length > 0
            ? expectedBucketStarts
            : [...bucketTotalsByStart.keys()].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        ).map((bucketStartUtc) => ({
          bucketStartUtc,
          totalCount: bucketTotalsByStart.get(bucketStartUtc) ?? 0,
        }))

        for (const bucket of overview.routeBucketTotals) {
          const bucketStart = normalizeBucketKey(bucket.bucketStartUtc)
          routeBucketsByStart[bucketStart] ??= {}
          const routeKey = ROUTE_COVERAGE_CONFIG.find((routeConfig) => routeConfig.route === bucket.route)?.key
          if (!routeKey) continue
          routeBucketsByStart[bucketStart][routeKey] = bucket.totalCount
        }

        setRouteBucketVisitsByStart(routeBucketsByStart)
        setVisitBucketTotals(normalizedBuckets)
        setOutboundClicks(
          Object.fromEntries(
            OUTBOUND_METRIC_CONFIG.map((routeConfig) => [routeConfig.key, outboundByPath.get(routeConfig.route) ?? 0]),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) {
          setRouteBucketVisitsByStart({})
          setVisitBucketTotals([])
          setOutboundClicks({})
        }
      })

    return () => {
      cancelled = true
    }
  }, [timeframe])

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics((current) => ({ ...current, [metric]: !current[metric] }))
  }

  return (
    <div className="recent-activity-widget" aria-label="Recent activity">
      <header className="recent-activity-widget__header">
        <Heading as="h2" size="6" weight="bold" className="recent-activity-widget__title">
          Recent Activity
        </Heading>
        <Text as="p" size="2" color="gray" className="recent-activity-widget__subtitle">
          User activity trends and repository history
        </Text>
      </header>

      <section className="recent-activity-widget__chart-section" aria-label="Activity chart">
        <Heading as="h3" size="4" weight="medium" className="recent-activity-widget__section-title">
          User Activity
        </Heading>
        <div className="recent-activity-widget__timeframe" role="tablist" aria-label="Select chart time range">
          {TIMEFRAME_CONFIG.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={timeframe === item.key}
              className={`recent-activity-widget__timeframe-button ${
                timeframe === item.key ? 'recent-activity-widget__timeframe-button--active' : ''
              }`}
              onClick={() => setTimeframe(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="recent-activity-widget__legend" aria-hidden>
          <button
            type="button"
            className={`recent-activity-widget__legend-toggle ${
              visibleMetrics.visits ? 'recent-activity-widget__legend-toggle--active' : ''
            }`}
            onClick={() => toggleMetric('visits')}
            aria-pressed={visibleMetrics.visits}
          >
            <span className="recent-activity-widget__legend-dot recent-activity-widget__legend-dot--visits" />
            User Visits
          </button>
          <button
            type="button"
            className={`recent-activity-widget__legend-toggle ${
              visibleMetrics.deployments ? 'recent-activity-widget__legend-toggle--active' : ''
            }`}
            onClick={() => toggleMetric('deployments')}
            aria-pressed={visibleMetrics.deployments}
          >
            <span className="recent-activity-widget__legend-dot recent-activity-widget__legend-dot--deployments" />
            Deployments
          </button>
        </div>

        <div className="recent-activity-widget__chart-stats" aria-live="polite">
          <Text as="span" size="1" color="gray">
            {activeLabel}
          </Text>
          {visibleMetrics.visits && (
            <Text as="span" size="1">
              User Visits: <strong>{activeVisits}</strong>
            </Text>
          )}
          {visibleMetrics.deployments && (
            <Text as="span" size="1">
              Deployments: <strong>{activeDeployments}</strong>
            </Text>
          )}
        </div>

        {hasVisibleMetric ? (
          <svg
            className="recent-activity-widget__chart"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={`User visits and deployments over the last ${timeframe}`}
          >
            {visitsPoints[activeIndex] && (
              <line
                x1={visitsPoints[activeIndex].x}
                y1={CHART_PADDING_TOP}
                x2={visitsPoints[activeIndex].x}
                y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
                className="recent-activity-widget__hover-line"
              />
            )}
            {visibleMetrics.visits && (
              <path d={visitsPath} className="recent-activity-widget__area recent-activity-widget__area--visits" />
            )}
            {visibleMetrics.deployments && (
              <path d={deploymentsPath} className="recent-activity-widget__area recent-activity-widget__area--deployments" />
            )}
            {visitsPoints.map((point, index) => (
              <g key={`point-${index}`}>
                {visibleMetrics.visits && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={index === activeIndex ? 3.5 : 2.25}
                    className="recent-activity-widget__point recent-activity-widget__point--visits"
                  >
                    <title>
                      {`${getBucketLabel(index, timeframe, chartSeries.visits.length)} - User Visits: ${chartSeries.visits[index]}`}
                    </title>
                  </circle>
                )}
                {visibleMetrics.deployments && (
                  <circle
                    cx={deploymentsPoints[index].x}
                    cy={deploymentsPoints[index].y}
                    r={index === activeIndex ? 3.5 : 2.25}
                    className="recent-activity-widget__point recent-activity-widget__point--deployments"
                  >
                    <title>
                      {`${getBucketLabel(index, timeframe, chartSeries.visits.length)} - Deployments: ${chartSeries.deployments[index]}`}
                    </title>
                  </circle>
                )}
              </g>
            ))}
            {visitsPoints.map((point, index) => (
              <rect
                key={`hover-${index}`}
                x={index === 0 ? CHART_PADDING_X : (visitsPoints[index - 1].x + point.x) / 2}
                y={CHART_PADDING_TOP}
                width={
                  index === visitsPoints.length - 1
                    ? CHART_WIDTH - CHART_PADDING_X - (index === 0 ? CHART_PADDING_X : (visitsPoints[index - 1].x + point.x) / 2)
                    : (point.x + visitsPoints[index + 1].x) / 2 - (index === 0 ? CHART_PADDING_X : (visitsPoints[index - 1].x + point.x) / 2)
                }
                height={CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM}
                className="recent-activity-widget__hover-zone"
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
                aria-label={`${getBucketLabel(index, timeframe, chartSeries.visits.length)}, user visits ${chartSeries.visits[index]}, deployments ${chartSeries.deployments[index]}`}
              />
            ))}
          </svg>
        ) : (
          <div className="recent-activity-widget__no-metrics">
            <Text as="p" size="2" color="gray">
              No metrics selected. Toggle one or more above.
            </Text>
          </div>
        )}
        <div className="recent-activity-widget__x-axis" aria-hidden>
          {xAxisLabelIndexes.map((index) => (
            <span key={`label-${index}`}>{getBucketLabel(index, timeframe, chartSeries.visits.length)}</span>
          ))}
        </div>

        <div className="recent-activity-widget__bar-section" aria-label="User visits by route">
          <Text as="p" size="1" color="gray" className="recent-activity-widget__bar-title">
            User Visits by route ({activeLabel})
          </Text>
          {visibleMetrics.visits ? (
            <div className="recent-activity-widget__bar-list">
              {ROUTE_COVERAGE_CONFIG.map((routeConfig) => {
                const count = displayedRouteVisits[routeConfig.key] ?? 0
                const width = `${Math.max(6, Math.round((count / maxRouteVisits) * 100))}%`
                return (
                  <div className="recent-activity-widget__bar-row" key={routeConfig.key}>
                    <span className="recent-activity-widget__bar-label">{routeConfig.label}</span>
                    <div className="recent-activity-widget__bar-track">
                      <div className="recent-activity-widget__bar-fill" style={{ width }} />
                    </div>
                    <span className="recent-activity-widget__bar-value">{count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="recent-activity-widget__warning-box">
              <Text as="p" size="1" color="gray">
                User Visits is hidden. Enable it above to view route totals.
              </Text>
            </div>
          )}
        </div>

        <div className="recent-activity-widget__bar-section" aria-label="Deployments for active time slot">
          <Text as="p" size="1" color="gray" className="recent-activity-widget__bar-title" weight="bold">
            Deployments ({activeLabel}: {activeDeployments} total)
          </Text>
          {visibleMetrics.deployments ? (
            <div className="recent-activity-widget__deployments-list">
              {deploymentRows.map((deployment, index) =>
                deployment ? (
                  <div className="recent-activity-widget__deployments-row" key={`deployment-row-${deployment.id}`}>
                    <span className="recent-activity-widget__deployments-message">
                      <a
                        href={deployment.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="recent-activity-widget__deployments-link"
                      >
                        {deployment.message}
                      </a>
                    </span>
                    <Text as="span" size="1" color="gray" className="recent-activity-widget__deployments-age">
                      {formatRelativeTime(deployment.date)}
                    </Text>
                  </div>
                ) : (
                  <div className="recent-activity-widget__deployments-row" key={`deployment-row-empty-${index}`}>
                    <span className="recent-activity-widget__deployments-message recent-activity-widget__deployments-message--empty">
                      No deployment in this period
                    </span>
                    <Text as="span" size="1" color="gray" className="recent-activity-widget__deployments-age">
                      -
                    </Text>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="recent-activity-widget__warning-box">
              <Text as="p" size="1" color="gray">
                Deployments is hidden. Enable it above to view this list.
              </Text>
            </div>
          )}
        </div>

        <div className="recent-activity-widget__outbound-section" aria-label="Outbound cta clicks">
          <Text as="p" size="1" color="gray" className="recent-activity-widget__bar-title">
            Outbound CTA Clicks ({timeframe})
          </Text>
          <div className="recent-activity-widget__outbound-grid">
            {OUTBOUND_METRIC_CONFIG.map((metric) => (
              <div key={metric.key} className="recent-activity-widget__outbound-card">
                <Text as="p" size="1" color="gray">
                  {metric.label}
                </Text>
                <Text as="p" size="4" weight="bold">
                  {(outboundClicks[metric.key] ?? 0).toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="recent-activity-widget__error" role="alert">
          <Text as="p" size="2" color="red">
            Could not load recent commits. Try again later.
          </Text>
        </div>
      )}

      {isLoading && (
        <div className="recent-activity-widget__loading" aria-busy="true">
          <Text as="p" size="2" color="gray">
            Loading…
          </Text>
        </div>
      )}

      {!isLoading && !error && displayCommits.length > 0 && (
        <section className="recent-activity-widget__commit-section" aria-label="Recent git commit history">
          <Heading as="h3" size="4" weight="medium" className="recent-activity-widget__section-title">
            Recent Git Commit History
          </Heading>
          <ol className="recent-activity-widget__timeline" role="list">
            {displayCommits.map((commit) => (
              <li key={commit.id} className="recent-activity-widget__entry">
                <span className="recent-activity-widget__node" aria-hidden />
                <div className="recent-activity-widget__card">
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recent-activity-widget__message"
                  >
                    {commit.message}
                  </a>
                  <div className="recent-activity-widget__meta">
                    {commit.avatarUrl && (
                      <img
                        src={commit.avatarUrl}
                        alt=""
                        width={20}
                        height={20}
                        className="recent-activity-widget__avatar"
                      />
                    )}
                    <span className="recent-activity-widget__author">
                      {commit.authorUrl ? (
                        <a
                          href={commit.authorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="recent-activity-widget__author-link"
                        >
                          {commit.authorLogin ?? commit.authorName}
                        </a>
                      ) : (
                        commit.authorName
                      )}
                    </span>
                    <Text as="span" size="1" color="gray" className="recent-activity-widget__time">
                      <time dateTime={commit.date} title={commit.date}>
                        {formatRelativeTime(commit.date)}
                      </time>
                    </Text>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!isLoading && !error && displayCommits.length === 0 && (
        <Text as="p" size="2" color="gray">
          No recent commits to show.
        </Text>
      )}
    </div>
  )
}
