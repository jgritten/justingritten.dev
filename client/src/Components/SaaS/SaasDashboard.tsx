import { Heading, Text } from '@radix-ui/themes'

export function SaasDashboard() {
  return (
    <div className="content-card">
      <section aria-label="SaaS dashboard">
        <Heading as="h1" size="7" weight="bold">
          SaaS Demo Dashboard
        </Heading>
        <Text as="p" size="3" color="gray">
          Home of the SaaS product demo. This area will evolve into a realistic multi-tenant,
          multi-user dashboard that showcases how you design and build commercial SaaS features.
        </Text>
      </section>
    </div>
  )
}

