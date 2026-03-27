import { useState, useEffect, useCallback } from 'react'
import type { GitHubCommitItem } from '@/types/github'

const GITHUB_COMMITS_BASE_URL = 'https://api.github.com/repos/jgritten/justingritten.dev/commits'
const COMMITS_PER_PAGE = 100
const MAX_PAGES = 3
const LOOKBACK_DAYS = 35

export interface RecentCommit {
  id: string
  message: string
  authorName: string
  authorLogin: string | null
  authorUrl: string | null
  avatarUrl: string | null
  date: string
  htmlUrl: string
}

export interface UseRecentCommitsResult {
  commits: RecentCommit[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

function mapCommit(item: GitHubCommitItem): RecentCommit {
  const firstLine = item.commit.message.split('\n')[0]?.trim() || item.commit.message
  return {
    id: item.sha,
    message: firstLine,
    authorName: item.commit.author.name,
    authorLogin: item.author?.login ?? null,
    authorUrl: item.author?.html_url ?? null,
    avatarUrl: item.author?.avatar_url ?? null,
    date: item.commit.author.date,
    htmlUrl: item.html_url,
  }
}

function getCommitsUrl(page: number): string {
  return `${GITHUB_COMMITS_BASE_URL}?per_page=${COMMITS_PER_PAGE}&page=${page}`
}

async function fetchRecentHistory(): Promise<RecentCommit[]> {
  const headers = { Accept: 'application/vnd.github.v3+json' }
  const lookbackStart = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  const results: RecentCommit[] = []

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await fetch(getCommitsUrl(page), { headers })
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)

    const data = (await res.json()) as GitHubCommitItem[]
    if (data.length === 0) break

    const mapped = data.map(mapCommit)
    results.push(...mapped)

    const oldest = mapped[mapped.length - 1]
    const oldestTime = oldest ? new Date(oldest.date).getTime() : Number.NaN
    if (data.length < COMMITS_PER_PAGE) break
    if (!Number.isNaN(oldestTime) && oldestTime < lookbackStart) break
  }

  return results
    .filter((commit) => {
      const timestamp = new Date(commit.date).getTime()
      return !Number.isNaN(timestamp) && timestamp >= lookbackStart
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/** Fetch recent commits from the public repo (GitHub API, no auth required). */
export function useRecentCommits(): UseRecentCommitsResult {
  const [commits, setCommits] = useState<RecentCommit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCommits = useCallback(() => {
    setIsLoading(true)
    setError(null)
    fetchRecentHistory()
      .then((data) => {
        setCommits(data)
      })
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchCommits()
  }, [fetchCommits])

  return { commits, isLoading, error, refetch: fetchCommits }
}
