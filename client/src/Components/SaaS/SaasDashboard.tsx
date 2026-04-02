import { Heading, Text } from '@radix-ui/themes'
import { saasClerkPublishableKey } from '@/utils/saasClerk'
import { SaasMeApiStatus } from './SaasMeApiStatus'

export function SaasDashboard() {
  return (
    <div className="content-card">
      <section aria-label="SaaS dashboard">
        <Heading as="h1" size="7" weight="bold">
          SaaS Demo Dashboard
        </Heading>
        <Text as="p" size="3" color="gray">
          Home of the SaaS product demo. This area will evolve into a realistic multi-tenant,
          multi-user dashboard that showcases designs and builds for commercial SaaS features.
        </Text>
        {saasClerkPublishableKey ? (
          <div className="saas-dashboard__api-status" style={{ marginTop: '1rem' }}>
            <SaasMeApiStatus />
          </div>
        ) : null}
      </section>
    </div>
  )
}

