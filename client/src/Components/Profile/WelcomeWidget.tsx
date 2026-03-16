import { Heading, Text, Button } from '@radix-ui/themes'
import './WelcomeWidget.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'
const GITHUB_PROFILE = 'https://github.com/jgritten'

export function WelcomeWidget() {
  return (
    <div className="welcome-widget">
      <div>
        <header className="welcome-widget__header" aria-label="Welcome">
          <Heading as="h1" size="9" weight="bold" className="welcome-widget__title">
            Justin Gritten
          </Heading>
          <Text as="p" size="4" className="welcome-widget__desc">
            Hi, I&apos;m Justin – a full‑stack developer based in British Columbia, Canada. I&apos;ve
            spent over a decade helping teams ship SaaS products that feel fast, polished, and easy to
            live in day‑to‑day.
          </Text>
        </header>
        <section className="welcome-widget__about" aria-label="About">
          <Text as="p" size="3" color="gray" className="welcome-widget__tagline">
            I care about thoughtful UX, strong engineering fundamentals, and closing the loop between
            design, implementation, and real‑world performance for clients.
          </Text>
          <div className="welcome-widget__actions">
            <Button size="3" asChild>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
              >
                View source on GitHub
              </a>
            </Button>
            <Button size="3" variant="soft" asChild>
              <a
                href={GITHUB_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
              >
                View profile on GitHub
              </a>
            </Button>
          </div>
          <Text as="p" size="1" color="gray" className="welcome-widget__stack">
            React · TypeScript · Vite · Radix UI · .NET
          </Text>
        </section>
      </div>
      <div className="welcome-widget__photo" aria-hidden="true">
        <div className="welcome-widget__photo-inner">
          <img
            src="/Justin.jpg"
            alt=""
          />
        </div>
      </div>
    </div>
  )
}

