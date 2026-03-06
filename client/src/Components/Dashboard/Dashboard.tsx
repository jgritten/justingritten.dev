import { Heading, Text, Button } from '@radix-ui/themes'
import './Dashboard.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'

export function Dashboard() {
  return (
    <div className="dashboard">
      <div className="content-card">
        <header className="dashboard__hero">
        <Heading as="h1" size="8" weight="bold" className="dashboard__name">
          Justin Gritten
        </Heading>
        <Text as="p" size="4" color="gray" className="dashboard__tagline">
          .NET & React developer
        </Text>
        <Text as="p" size="2" color="gray" className="dashboard__sub">
          Building full-stack applications · justingritten.dev
        </Text>
        <div className="dashboard__actions">
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
        <Text as="p" size="1" color="gray" className="dashboard__stack">
          React · TypeScript · Vite · Radix UI · .NET
        </Text>
        </header>
      </div>
    </div>
  )
}
