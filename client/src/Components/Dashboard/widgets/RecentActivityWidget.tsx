import { Heading, Text } from '@radix-ui/themes'
import { useRecentCommits } from '@/hooks'
import { formatRelativeTime } from '@/utils/relativeTime'
import './RecentActivityWidget.css'

const DEFAULT_COMMIT_LIMIT = 5

export function RecentActivityWidget() {
  const { commits, isLoading, error } = useRecentCommits()
  const displayCommits = commits.slice(0, DEFAULT_COMMIT_LIMIT)

  return (
    <div className="recent-activity-widget" aria-label="Recent activity">
      <header className="recent-activity-widget__header">
        <Heading as="h2" size="6" weight="bold" className="recent-activity-widget__title">
          Recent Activity
        </Heading>
        <Text as="p" size="2" color="gray" className="recent-activity-widget__subtitle">
          Latest commits from the repository
        </Text>
      </header>

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
      )}

      {!isLoading && !error && displayCommits.length === 0 && (
        <Text as="p" size="2" color="gray">
          No recent commits to show.
        </Text>
      )}
    </div>
  )
}
