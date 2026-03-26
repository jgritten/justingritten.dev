import { useEffect, useState } from 'react'
import { Heading, Text, Button, Badge, Flex } from '@radix-ui/themes'
import { useIsDarkTheme } from '@/contexts/ThemeContext'
import { metricsApi } from '@/api'
import { SITE_VERSION } from '@/utils/siteVersion'
import './WelcomeWidget.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'
const GITHUB_PROFILE = 'https://github.com/jgritten'
const EMAIL = 'justin.gritten@gmail.com'

function VersionBadge() {
  return (
    <div className="welcome-widget__version">
      <Text as="span" size="2" color="gray">
        Site version{' '}
        <Badge size="1" color="green" variant="soft">
          v{SITE_VERSION}
        </Badge>
      </Text>
    </div>
  )
}

function VisitorCount({ totalCount }: { totalCount: number | null }) {
  if (totalCount === null) return null
  return (
    <div className="welcome-widget__visitors">
      <Text as="span" size="2" color="gray">
        {totalCount.toLocaleString()} visitor{totalCount === 1 ? '' : 's'}
      </Text>
    </div>
  )
}

export function WelcomeWidget() {
  const isDark = useIsDarkTheme()
  const [visitCount, setVisitCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    metricsApi
      .getSummary('/')
      .then((s) => {
        if (!cancelled) setVisitCount(s.totalCount)
      })
      .catch(() => {
        if (!cancelled) setVisitCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="welcome-widget">
      <div className="welcome-widget__inner">
        <div className="welcome-widget__text">
          <header className="welcome-widget__row welcome-widget__row--top" aria-label="Welcome">
            <div className="welcome-widget__col welcome-widget__col--primary">
              <Heading as="h1" size="9" weight="bold" className="welcome-widget__title">
                Justin Gritten
              </Heading>
            </div>
            <div className="welcome-widget__col welcome-widget__col--meta">
              <VersionBadge />
              <VisitorCount totalCount={visitCount} />
            </div>
          </header>

          <section className="welcome-widget__row welcome-widget__row--middle" aria-label="Role and contact">
            <div className="welcome-widget__col welcome-widget__col--primary">
              <Text as="p" size="3" className="welcome-widget__role">
                Senior Full‑Stack Engineer (SaaS & MVPs), helping teams ship and rescue SaaS products.
              </Text>
            </div>
            <div className="welcome-widget__col welcome-widget__col--meta">
              <Text as="p" size="2" color="gray" className="welcome-widget__email">
                <span>Email:</span>{' '}
                <a href={`mailto:${EMAIL}`} className="welcome-widget__email-link">
                  {EMAIL}
                </a>
              </Text>
            </div>
          </section>

          <section className="welcome-widget__row welcome-widget__row--bottom" aria-label="Availability and links">
            <div className="welcome-widget__availability">
              <span className="welcome-widget__availability-dot" aria-hidden="true" />
              <Text as="span" size="2" className="welcome-widget__availability-text">
                Available for work
              </Text>
              <span className="welcome-widget__divider" aria-hidden="true" />
              <span className="welcome-widget__location-group">
                <span className="welcome-widget__location-icon" aria-hidden="true">
                  &#x1F4CD;
                </span>
                <Text as="span" size="2" color="gray">
                  Lake Country, BC
                </Text>
              </span>
              <span className="welcome-widget__divider" aria-hidden="true" />
              <Flex gap="2" className="welcome-widget__quick-links">
                <Button size="3" asChild>
                  <a
                    href={GITHUB_PROFILE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub profile
                  </a>
                </Button>
                <Button size="3" variant="soft" asChild>
                  <a
                    href={GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Site repo
                  </a>
                </Button>
              </Flex>
            </div>
          </section>
        </div>
        <div className="welcome-widget__image" aria-hidden="true">
          <img
            src={isDark ? '/Justin.jpg' : '/justin_nomad_coder.jpg'}
            alt=""
          />
        </div>
      </div>
    </div>
  )
}

