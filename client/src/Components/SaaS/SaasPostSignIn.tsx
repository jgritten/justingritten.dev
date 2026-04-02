import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useSaasClient } from '@/contexts/SaasClientContext'
import { saasClerkPublishableKey } from '@/utils/saasClerk'

/**
 * Landing step after Clerk sign-in. Today: sync demo client context + explicit CTA to the dashboard.
 * Future (tenancy): pending invites, accept/decline, choose client when multiple memberships (see roadmap Phase 2).
 */
export function SaasPostSignIn() {
  if (!saasClerkPublishableKey) {
    return <Navigate to="/saas" replace />
  }
  return <SaasPostSignInWithClerk />
}

function SaasPostSignInWithClerk() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const { setActiveClient } = useSaasClient()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    const label =
      user.fullName ||
      user.primaryEmailAddress?.emailAddress ||
      user.username ||
      'Account'
    setActiveClient({
      id: user.id,
      name: label,
      // Tenant logos come from client records later — not the signed-in user's profile photo.
    })
  }, [isLoaded, isSignedIn, user, setActiveClient])

  if (!isLoaded) {
    return (
      <div className="content-card">
        <Text as="p" size="3" color="gray">
          Loading…
        </Text>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/saas" replace />
  }

  return (
    <div className="content-card">
      <Card size="3" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Heading as="h1" size="6">
            Welcome
          </Heading>
          <Text as="p" size="3" color="gray">
            You&apos;re signed in. Next we&apos;ll add tenant flows here: pending invitations, choosing a
            client when you belong to several, and skipping straight to the dashboard when you only have
            one. For now, continue into the SaaS demo shell when you&apos;re ready.
          </Text>
          <Flex gap="3" wrap="wrap">
            <Button size="3" onClick={() => navigate('/saas/dashboard')}>
              Continue to dashboard
            </Button>
            <Button size="3" variant="soft" onClick={() => navigate('/saas')}>
              Back to SaaS entry
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}
