import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { Badge, Button, Card, Checkbox, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import {
  acceptTenantInvitation,
  declineTenantInvitation,
  fetchTenantWorkspace,
  updateTenantPreferences,
  type CreateTenantClientResponse,
  type TenantWorkspace,
} from '@/api/saasTenancy'
import { useSaasClient } from '@/contexts/SaasClientContext'
import { saasClerkPublishableKey } from '@/utils/saasClerk'
import { ClientCreationWizard } from './ClientCreationWizard'

/**
 * Post–Clerk workspace hub: memberships, invitations, Create Client wizard, default client + optional skip-hub.
 */
export function SaasPostSignIn() {
  if (!saasClerkPublishableKey) {
    return <Navigate to="/saas" replace />
  }
  return <SaasPostSignInWithClerk />
}

function SaasPostSignInWithClerk() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user } = useUser()
  const { setActiveClient } = useSaasClient()

  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  const didAutoRedirectRef = useRef(false)

  const accountLabel =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    user?.username ||
    'Account'

  const refreshWorkspace = useCallback(async () => {
    const token = await getToken()
    const data = await fetchTenantWorkspace(token)
    setWorkspace(data)
    return data
  }, [getToken])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      setLoadError(null)
      try {
        const data = await refreshWorkspace()
        if (cancelled) return
        setLoadState('ok')
        setWorkspace(data)
      } catch (e) {
        if (cancelled) return
        setLoadState('error')
        setLoadError(e instanceof Error ? e.message : 'Workspace could not be loaded.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, refreshWorkspace])

  useEffect(() => {
    if (loadState !== 'ok' || !workspace || didAutoRedirectRef.current) return
    const { preferences, memberships } = workspace
    if (
      preferences.skipHubWhenDefaultAvailable &&
      preferences.defaultClientId &&
      memberships.some((m) => m.clientId === preferences.defaultClientId)
    ) {
      didAutoRedirectRef.current = true
      const m = memberships.find((x) => x.clientId === preferences.defaultClientId)
      if (m) {
        setActiveClient({ id: m.clientId, name: m.name })
        navigate('/saas/dashboard', { replace: true })
      }
    }
  }, [loadState, workspace, navigate, setActiveClient])

  const openDashboard = (clientId: string, name: string) => {
    setActiveClient({ id: clientId, name })
    navigate('/saas/dashboard')
  }

  const continueDemoWithoutTenancy = () => {
    if (!user) return
    setActiveClient({
      id: user.id,
      name: accountLabel,
    })
    navigate('/saas/dashboard')
  }

  const persistPreferences = async (next: TenantWorkspace['preferences']) => {
    const token = await getToken()
    await updateTenantPreferences(token, next)
    await refreshWorkspace()
  }

  const handleSetDefault = async (clientId: string | null) => {
    if (!workspace) return
    setActionBusy(true)
    try {
      await persistPreferences({
        defaultClientId: clientId,
        skipHubWhenDefaultAvailable: workspace.preferences.skipHubWhenDefaultAvailable,
      })
    } finally {
      setActionBusy(false)
    }
  }

  const handleSkipHubChange = async (checked: boolean) => {
    if (!workspace) return
    setActionBusy(true)
    try {
      await persistPreferences({
        defaultClientId: workspace.preferences.defaultClientId,
        skipHubWhenDefaultAvailable: checked,
      })
    } finally {
      setActionBusy(false)
    }
  }

  const handleAcceptInvite = async (invitationId: string) => {
    setActionBusy(true)
    try {
      const token = await getToken()
      await acceptTenantInvitation(token, invitationId)
      await refreshWorkspace()
    } finally {
      setActionBusy(false)
    }
  }

  const handleDeclineInvite = async (invitationId: string) => {
    setActionBusy(true)
    try {
      const token = await getToken()
      await declineTenantInvitation(token, invitationId)
      await refreshWorkspace()
    } finally {
      setActionBusy(false)
    }
  }

  const handleCreatedClient = (created: CreateTenantClientResponse) => {
    setActiveClient({ id: created.clientId, name: created.name })
    navigate('/saas/dashboard')
    void refreshWorkspace()
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

  if (!isSignedIn) {
    return <Navigate to="/saas" replace />
  }

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="content-card">
        <Text as="p" size="3" color="gray">
          Loading workspace…
        </Text>
      </div>
    )
  }

  if (loadState === 'error' || !workspace) {
    return (
      <div className="content-card">
        <Card size="3" style={{ maxWidth: 560, margin: '0 auto' }}>
          <Flex direction="column" gap="4">
            <Heading as="h1" size="6">
              Workspace
            </Heading>
            <Text as="p" size="3" color="gray">
              {loadError ?? 'Something went wrong.'} You can still open the SaaS demo shell with your signed-in
              account as the active context, or retry after the API is reachable.
            </Text>
            <Flex gap="3" wrap="wrap">
              <Button
                size="3"
                onClick={() => {
                  void (async () => {
                    setLoadState('loading')
                    setLoadError(null)
                    try {
                      const data = await refreshWorkspace()
                      setWorkspace(data)
                      setLoadState('ok')
                    } catch (e) {
                      setLoadState('error')
                      setLoadError(e instanceof Error ? e.message : 'Workspace could not be loaded.')
                    }
                  })()
                }}
              >
                Retry
              </Button>
              <Button size="3" variant="soft" onClick={continueDemoWithoutTenancy}>
                Continue to dashboard (demo)
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

  return (
    <div className="content-card">
      <Card size="3" style={{ maxWidth: 640, margin: '0 auto' }}>
        <Flex direction="column" gap="4">
          <Heading as="h1" size="6">
            Workspace
          </Heading>
          <Text as="p" size="3" color="gray">
            Signed in as {accountLabel}. Choose a client, handle invitations, or create a new one before opening the
            dashboard.
          </Text>

          {!workspace.hasEmailClaim ? (
            <Text as="p" size="2" color="amber">
              Your Clerk session token does not include an email claim the API recognizes, so pending invitations
              (including the <strong>Northwinds Demo</strong> invite) will not appear. In the Clerk Dashboard, open{' '}
              <strong>Sessions</strong> → <strong>Customize session token</strong> and add something like{' '}
              <code className="saas-entry__code">
                {`"email": "{{user.primary_email_address}}"`}
              </code>{' '}
              (see <code className="saas-entry__code">docs/development.md</code>). Sign out and back in after saving.
            </Text>
          ) : null}

          {workspace.invitations.length > 0 ? (
            <>
              <Heading as="h2" size="4">
                Pending invitations
              </Heading>
              <Flex direction="column" gap="3">
                {workspace.invitations.map((inv) => (
                  <Card key={inv.id} variant="surface">
                    <Flex direction="column" gap="2">
                      <Text size="2">
                        <strong>{inv.clientName}</strong> — role: {inv.role}
                      </Text>
                      <Text size="1" color="gray">
                        {inv.inviteeEmail}
                      </Text>
                      {inv.isDemoWorkspace ? (
                        <Text size="1" color="gray">
                          Pre-filled demo workspace — explore the app with shared sample data, or decline and create your
                          own client.
                        </Text>
                      ) : null}
                      <Flex gap="2" wrap="wrap">
                        <Button
                          size="2"
                          disabled={actionBusy}
                          onClick={() => void handleAcceptInvite(inv.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="2"
                          variant="soft"
                          disabled={actionBusy}
                          onClick={() => void handleDeclineInvite(inv.id)}
                        >
                          Decline
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
              <Separator size="4" />
            </>
          ) : null}

          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Heading as="h2" size="4">
              Your clients
            </Heading>
            <Button size="2" onClick={() => setWizardOpen(true)}>
              Create client
            </Button>
          </Flex>

          {workspace.memberships.length === 0 ? (
            <Text as="p" size="2" color="gray">
              You&apos;re not a member of any client yet. Create one to get a tenant-scoped dashboard, or accept an
              invitation above.
            </Text>
          ) : (
            <Flex direction="column" gap="3">
              {workspace.memberships.map((m) => {
                const isDefault = workspace.preferences.defaultClientId === m.clientId
                return (
                  <Card key={m.clientId} variant="surface">
                    <Flex align="center" justify="between" gap="3" wrap="wrap">
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="2" wrap="wrap">
                          <Text size="2" weight="medium">
                            {m.name}
                          </Text>
                          {isDefault ? (
                            <Badge size="1" color="blue">
                              Default
                            </Badge>
                          ) : null}
                        </Flex>
                        <Text size="1" color="gray">
                          Role: {m.role}
                        </Text>
                      </Flex>
                      <Flex gap="2" wrap="wrap">
                        {!isDefault ? (
                          <Button
                            size="2"
                            variant="soft"
                            disabled={actionBusy}
                            onClick={() => void handleSetDefault(m.clientId)}
                          >
                            Set default
                          </Button>
                        ) : (
                          <Button
                            size="2"
                            variant="soft"
                            disabled={actionBusy}
                            onClick={() => void handleSetDefault(null)}
                          >
                            Clear default
                          </Button>
                        )}
                        <Button size="2" onClick={() => openDashboard(m.clientId, m.name)}>
                          Open dashboard
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )
              })}
            </Flex>
          )}

          <Separator size="4" />

          <Flex align="center" gap="3" wrap="wrap">
            <Checkbox
              id="saas-skip-hub"
              checked={workspace.preferences.skipHubWhenDefaultAvailable}
              disabled={actionBusy || !workspace.preferences.defaultClientId}
              onCheckedChange={(v) => void handleSkipHubChange(v === true)}
            />
            <Text as="label" htmlFor="saas-skip-hub" size="2" color="gray" style={{ flex: 1, minWidth: 200 }}>
              Skip this page next time when I have a default client (still shown if the default is invalid or
              removed).
            </Text>
          </Flex>
          {!workspace.preferences.defaultClientId ? (
            <Text size="1" color="gray">
              Set a default client above to enable auto-redirect on future sign-ins.
            </Text>
          ) : null}

          <Flex gap="3" wrap="wrap">
            <Button size="3" variant="soft" onClick={() => navigate('/saas')}>
              Back to SaaS entry
            </Button>
          </Flex>
        </Flex>
      </Card>

      <ClientCreationWizard open={wizardOpen} onOpenChange={setWizardOpen} onCreated={handleCreatedClient} />
    </div>
  )
}
