import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useAuth, useUser } from '@clerk/react'
import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useSaasClient } from '@/contexts/SaasClientContext'
import { saasClerkPublishableKey } from '@/utils/saasClerk'

export function SaasEntry() {
  if (!saasClerkPublishableKey) {
    return <SaasEntryWithoutClerk />
  }
  return <SaasEntryWithClerk />
}

/** Placeholder flow when `VITE_CLERK_PUBLISHABLE_KEY` is not set. */
function SaasEntryWithoutClerk() {
  const navigate = useNavigate()
  const { setActiveClient } = useSaasClient()

  const enterAsGuest = () => {
    setActiveClient({
      id: 'guest-client',
      name: 'Guest Client',
      logoUrl: undefined,
    })
    navigate('/saas/dashboard')
  }

  return (
    <div className="content-card">
      <Card size="3" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Heading as="h1" size="6">
            SaaS Demo
          </Heading>
          <Text as="p" size="3" color="gray">
            Add <code className="saas-entry__code">VITE_CLERK_PUBLISHABLE_KEY</code> in{' '}
            <code className="saas-entry__code">client/.env</code> to enable Clerk sign-in. Until then,
            continue as a guest to explore the shell.
          </Text>
          <Flex gap="3" justify="start" wrap="wrap">
            <Button size="3" variant="soft" onClick={enterAsGuest}>
              Continue as Guest
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

function SaasEntryWithClerk() {
  const navigate = useNavigate()
  const { setActiveClient } = useSaasClient()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()

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
    navigate('/saas/post-sign-in', { replace: true })
  }, [isLoaded, isSignedIn, user, navigate, setActiveClient])

  const continueAsGuest = () => {
    setActiveClient({
      id: 'guest-client',
      name: 'Guest Client',
      logoUrl: undefined,
    })
    navigate('/saas/dashboard')
  }

  if (!isLoaded) {
    return (
      <div className="content-card">
        <Text as="p" size="3" color="gray">
          Loading…
        </Text>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="content-card">
        <Text as="p" size="3" color="gray">
          Redirecting…
        </Text>
      </div>
    )
  }

  return (
    <div className="content-card">
      <Card size="3" style={{ maxWidth: 480, margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Heading as="h1" size="6">
            SaaS Demo
          </Heading>
          <Text as="p" size="3" color="gray">
            Sign in with Clerk to exercise the protected API, or continue as a guest.
          </Text>
          <div className="saas-entry__sign-in">
            <SignIn
              forceRedirectUrl="/saas/post-sign-in"
              fallbackRedirectUrl="/saas/post-sign-in"
              signUpForceRedirectUrl="/saas/post-sign-in"
              signUpFallbackRedirectUrl="/saas/post-sign-in"
            />
          </div>
          <Button size="3" variant="soft" onClick={continueAsGuest}>
            Continue as Guest
          </Button>
        </Flex>
      </Card>
    </div>
  )
}
