import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders Recent Activity heading and subtitle', () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
    render(<RecentActivityWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: 'Recent Activity', level: 2 })).toBeTruthy()
    expect(screen.getByText('Latest commits from the repository')).toBeTruthy()
  })

  it('shows loading state initially then commits when fetch succeeds', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCommits),
    })
    render(<RecentActivityWidgetWithTheme />)
    expect(screen.getByText('Loading…')).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByText('feat: add Recent Activity widget')).toBeTruthy()
    })
    expect(screen.getByRole('link', { name: 'feat: add Recent Activity widget' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'jgritten' })).toBeTruthy()
  })

  it('shows error message when fetch fails', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 500 })
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
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(five) })
    render(<RecentActivityWidgetWithTheme />)
    await waitFor(() => {
      expect(screen.getByText('Commit 0')).toBeTruthy()
      expect(screen.getByText('Commit 4')).toBeTruthy()
    })
    expect(screen.getByRole('list')).toBeTruthy()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBe(5)
  })
})
