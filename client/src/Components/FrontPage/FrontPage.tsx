import { Heading, Text, Button } from '@radix-ui/themes'
import './FrontPage.css'

export function FrontPage() {
  return (
    <div className="front-page">
      <header className="front-page__hero">
        <Heading as="h1" size="8" weight="bold" className="front-page__name">
          Justin Gritten
        </Heading>
        <Text as="p" size="4" color="gray" className="front-page__tagline">
          .NET & React developer
        </Text>
        <Text as="p" size="2" color="gray" className="front-page__sub">
          Building full-stack applications · justingritten.dev
        </Text>
        <div className="front-page__actions">
          <Button size="3" asChild>
            <a
              href="https://github.com/jgritten/justingritten.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source on GitHub
            </a>
          </Button>
        </div>
        <Text as="p" size="1" color="gray" className="front-page__stack">
          React · TypeScript · Vite · Radix UI · .NET
        </Text>
      </header>
    </div>
  )
}
