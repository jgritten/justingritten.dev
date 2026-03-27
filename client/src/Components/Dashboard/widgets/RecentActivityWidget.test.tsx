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

        if (url.includes('/api/metrics/summary')) {
          const route = new URL(url).searchParams.get('route') ?? '/'
          const routeCount: Record<string, number> = {
            '/': 20,
            '/build': 7,
            '/saas': 6,
            '/saas/dashboard': 11,
            '/saas/settings': 9,
            '/saas/settings/account': 5,
            '/saas/settings/application': 4,
            '/saas/settings/client': 3,
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                route,
                totalCount: routeCount[route] ?? 0,
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
})
