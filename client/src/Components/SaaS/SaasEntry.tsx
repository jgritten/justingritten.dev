import { useNavigate } from 'react-router-dom'
import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes'

export function SaasEntry() {
  const navigate = useNavigate()

  return (
    <div className="content-card">
      <Card size="3" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Heading as="h1" size="6">
            SaaS Demo
          </Heading>
          <Text as="p" size="3" color="gray">
            This is the entry point to the SaaS product demo. In the future this will support full
            authentication. For now, log in as a placeholder user or continue as a guest.
          </Text>
          <Flex gap="3" justify="start" wrap="wrap">
            <Button
              size="3"
              onClick={() => {
                // Placeholder for real auth
                navigate('/saas/dashboard')
              }}
            >
              Log in (placeholder)
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={() => {
                navigate('/saas/dashboard')
              }}
            >
              Continue as Guest
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

