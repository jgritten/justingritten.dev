/** Minimal shape for GitHub API list commits response items (public repo). */
export interface GitHubCommitItem {
  sha: string
  html_url: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
    html_url: string
  } | null
}
