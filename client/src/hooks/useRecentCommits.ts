import { useState, useEffect, useCallback } from 'react'
import type { GitHubCommitItem } from '@/types/github'

const GITHUB_COMMITS_URL =
  'https://api.github.com/repos/jgritten/justingritten.dev/commits?per_page=5'

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

/** Fetch recent commits from the public repo (GitHub API, no auth required). */
export function useRecentCommits(): UseRecentCommitsResult {
  const [commits, setCommits] = useState<RecentCommit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCommits = useCallback(() => {
    setIsLoading(true)
    setError(null)
    fetch(GITHUB_COMMITS_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`)
        return res.json()
      })
      .then((data: GitHubCommitItem[]) => {
        setCommits(data.map(mapCommit))
      })
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchCommits()
  }, [fetchCommits])

  return { commits, isLoading, error, refetch: fetchCommits }
}
