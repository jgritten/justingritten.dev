import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { RecentActivityWidget } from './RecentActivityWidget'

const mockCommits = [
  {
    sha: 'abc123',
    html_url: 'https://github.com/jgritten/justingritten.dev/commit/abc123',
    commit: {
      message: 'feat: add Recent Activity widget',
      author: { name: 'Justin Gritten', email: 'j@example.com', date: '2026-03-09T12:00:00Z' },
    },
    author: {
      login: 'jgritten',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      html_url: 'https://github.com/jgritten',
    },
  },
]

function RecentActivityWidgetWithTheme() {
  return (
    <ThemeProvider>
      <RecentActivityWidget />
    </ThemeProvider>
  )
}

describe('RecentActivityWidget', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('api.github.com')) {
          const page = new URL(url).searchParams.get('page')
          if (page === '1' || page === null) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockCommits),
            } as Response)
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          } as Response)
        }

        if (url.includes('/api/metrics/overview')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                period: 'week',
                fromUtc: '2026-03-03T00:00:00Z',
                toUtc: '2026-03-09T23:59:59Z',
                routeTotals: [
                  { route: '/', totalCount: 20 },
                  { route: '/build', totalCount: 7 },
                  { route: '/saas', totalCount: 6 },
                  { route: '/saas/dashboard', totalCount: 11 },
                  { route: '/saas/settings', totalCount: 9 },
                  { route: '/saas/settings/account', totalCount: 5 },
                  { route: '/saas/settings/application', totalCount: 4 },
                  { route: '/saas/settings/client', totalCount: 3 },
                ],
                outboundTotals: [
                  { route: '/outbound/resume', totalCount: 12 },
                  { route: '/outbound/linkedin', totalCount: 8 },
                  { route: '/outbound/email', totalCount: 6 },
                ],
                bucketTotals: [
                  { bucketStartUtc: '2026-03-03T00:00:00Z', totalCount: 5 },
                  { bucketStartUtc: '2026-03-04T00:00:00Z', totalCount: 8 },
                ],
                routeBucketTotals: [
                  { bucketStartUtc: '2026-03-04T00:00:00Z', route: '/build', totalCount: 3 },
                  { bucketStartUtc: '2026-03-04T00:00:00Z', route: '/saas', totalCount: 2 },
                ],
              }),
          } as Response)
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders Recent Activity heading and subtitle', () => {
    render(<RecentActivityWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: 'Recent Activity', level: 2 })).toBeTruthy()
    expect(screen.getByText('User activity trends and repository history')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'User Activity', level: 3 })).toBeTruthy()
  })

  it('shows loading state initially then commits when fetch succeeds', async () => {
    render(<RecentActivityWidgetWithTheme />)
    expect(screen.getByText('Loading…')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByText('feat: add Recent Activity widget')).toBeTruthy()
    })
    expect(screen.getByRole('heading', { name: 'Recent Git Commit History', level: 3 })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'feat: add Recent Activity widget' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'jgritten' })).toBeTruthy()
  })

  it('shows error message when fetch fails', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 500 } as Response),
    )
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText(/Could not load recent commits/)).toBeTruthy()
    })
  })

  it('shows up to 5 commit entries sorted by most recent', async () => {
    const five = Array.from({ length: 5 }, (_, i) => ({
      ...mockCommits[0],
      sha: `sha-${i}`,
      commit: {
        ...mockCommits[0].commit,
        message: `Commit ${i}`,
        author: { ...mockCommits[0].commit.author, date: `2026-03-0${9 - i}T12:00:00Z` },
      },
    }))
    ;(fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(five) } as Response),
    )
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText('Commit 0')).toBeTruthy()
      expect(screen.getByText('Commit 4')).toBeTruthy()
    })
    expect(screen.getByRole('list')).toBeTruthy()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(5)
  })

  it('supports hiding both metric series via toggles', async () => {
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText('feat: add Recent Activity widget')).toBeTruthy()
    })

    fireEvent.click(screen.getByText('User Visits', { selector: 'button' }))
    fireEvent.click(screen.getByText('Deployments', { selector: 'button' }))

    expect(screen.getByText(/No metrics selected/)).toBeTruthy()
  })

  it('shows explicit saas settings routes in route coverage list', async () => {
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText('/saas/settings/account')).toBeTruthy()
    })
    expect(screen.getByText('/saas/settings/application')).toBeTruthy()
    expect(screen.getByText('/saas/settings/client')).toBeTruthy()
  })

  it('shows outbound cta click totals', async () => {
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText('Outbound CTA Clicks (week)')).toBeTruthy()
    })
    expect(screen.getByText('Resume')).toBeTruthy()
    expect(screen.getByText('LinkedIn')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
  })
})
