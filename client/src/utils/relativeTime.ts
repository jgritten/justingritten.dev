/**
 * Format a date string (ISO 8601) as relative time (e.g. "2 hours ago").
 * Falls back to formatted date if Intl.RelativeTimeFormat is unavailable or date is invalid.
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  try {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second')
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')
    return rtf.format(Math.round(diffDay / 30), 'month')
  } catch {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }
}
