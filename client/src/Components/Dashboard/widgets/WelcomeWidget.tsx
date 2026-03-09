import { Heading, Text, Button } from '@radix-ui/themes'
import './WelcomeWidget.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'

export function WelcomeWidget() {
  return (
    <div className="welcome-widget">
      <header className="welcome-widget__header" aria-label="Welcome">
        <Heading as="h1" size="9" weight="bold" className="welcome-widget__title">
          Welcome
        </Heading>
        <Text as="p" size="5" className="welcome-widget__desc">
          This site is a living portfolio of SaaS-style features and full-stack product delivery.
          Explore as a guest—and come back often; things change daily.
        </Text>
      </header>
      <section className="welcome-widget__about" aria-label="About">
        <Heading as="h2" size="6" weight="bold" className="welcome-widget__name">
          Justin Gritten
        </Heading>
        <Text as="p" size="4" color="gray" className="welcome-widget__tagline">
          .NET & React developer
        </Text>
        <Text as="p" size="2" color="gray" className="welcome-widget__sub">
          Building full-stack applications · justingritten.dev
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
        </div>
        <Text as="p" size="1" color="gray" className="welcome-widget__stack">
          React · TypeScript · Vite · Radix UI · .NET
        </Text>
      </section>
    </div>
  )
}
