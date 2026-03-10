import { describe, it, expect, vi } from 'vitest'
import { formatRelativeTime } from './relativeTime'

describe('formatRelativeTime', () => {
  it('returns input when date is invalid', () => {
    expect(formatRelativeTime('not-a-date')).toBe('not-a-date')
  })

  it('formats seconds, minutes, hours, days, and months relatively', () => {
    const now = new Date()

    expect(formatRelativeTime(new Date(now.getTime() - 30 * 1000).toISOString())).toMatch(/second/)
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60 * 1000).toISOString())).toMatch(
      /minute/
    )
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString())).toMatch(
      /hour/
    )
    expect(
      formatRelativeTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString())
    ).toMatch(/day/)
    expect(
      formatRelativeTime(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString())
    ).toMatch(/month/)
  })

  it('falls back to formatted date when RelativeTimeFormat throws', () => {
    const spy = vi
      .spyOn(Intl as unknown as { RelativeTimeFormat: typeof Intl.RelativeTimeFormat }, 'RelativeTimeFormat')
      .mockImplementation(() => {
        throw new Error('nope')
      })

    const result = formatRelativeTime(new Date().toISOString())

    expect(result).toMatch(/\w{3} \d{1,2}/)

    spy.mockRestore()
  })
})

