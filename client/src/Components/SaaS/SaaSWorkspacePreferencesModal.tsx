import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  Separator,
  Text,
} from '@radix-ui/themes'
import { fetchTenantWorkspace, updateTenantPreferences, type TenantWorkspace } from '@/api/saasTenancy'
import './SaaSWorkspacePreferencesModal.css'

type SectionId = 'default-client'

export function SaaSWorkspacePreferencesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { getToken } = useAuth()
  const [section, setSection] = useState<SectionId>('default-client')
  const [workspace, setWorkspace] = useState<TenantWorkspace | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const token = await getToken()
        const w = await fetchTenantWorkspace(token)
        if (!cancelled) setWorkspace(w)
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Could not load preferences.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, getToken])

  const prefs = workspace?.preferences
  const memberships = workspace?.memberships ?? []

  const persist = async (next: {
    defaultClientId: string | null
    skipHubWhenDefaultAvailable: boolean
  }) => {
    setSaving(true)
    setErr(null)
    try {
      const token = await getToken()
      await updateTenantPreferences(token, next)
      const w = await fetchTenantWorkspace(token)
      setWorkspace(w)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const clearDefault = () => {
    if (!prefs) return
    void persist({
      defaultClientId: null,
      skipHubWhenDefaultAvailable: false,
    })
  }

  const setDefaultClient = (clientId: string) => {
    if (!prefs) return
    void persist({
      defaultClientId: clientId,
      skipHubWhenDefaultAvailable: prefs.skipHubWhenDefaultAvailable,
    })
  }

  const toggleSkipHub = (checked: boolean) => {
    if (!prefs) return
    void persist({
      defaultClientId: prefs.defaultClientId,
      skipHubWhenDefaultAvailable: checked,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        size="3"
        className="saas-prefs-modal"
        maxWidth="42rem"
        aria-describedby={undefined}
      >
        <Dialog.Title>Workspace preferences</Dialog.Title>

        <div className="saas-prefs-modal__body">
          <aside className="saas-prefs-modal__sidebar" aria-label="Preference sections">
            <button
              type="button"
              className={
                section === 'default-client'
                  ? 'saas-prefs-modal__nav-item saas-prefs-modal__nav-item--active'
                  : 'saas-prefs-modal__nav-item'
              }
              onClick={() => setSection('default-client')}
            >
              Default client
            </button>
          </aside>

          <div className="saas-prefs-modal__content">
            {section === 'default-client' ? (
              <>
                <Heading as="h2" size="4" mb="3">
                  Default client
                </Heading>
                <Text as="p" size="2" color="gray" mb="4">
                  After sign-in, you can skip the workspace hub when a default is set and the option below is
                  enabled. Change it here anytime.
                </Text>

                {loading ? (
                  <Text color="gray">Loading…</Text>
                ) : err ? (
                  <Text color="red">{err}</Text>
                ) : (
                  <Flex direction="column" gap="4">
                    <div>
                      <Text size="2" weight="medium" mb="2">
                        Current default
                      </Text>
                      <Text size="2" color="gray">
                        {prefs?.defaultClientId
                          ? memberships.find((m) => m.clientId === prefs.defaultClientId)?.name ??
                            prefs.defaultClientId
                          : 'None'}
                      </Text>
                    </div>

                    <Flex gap="2" wrap="wrap">
                      <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        disabled={saving || !prefs?.defaultClientId}
                        onClick={() => clearDefault()}
                      >
                        Clear default
                      </Button>
                    </Flex>

                    {memberships.length > 0 ? (
                      <>
                        <Separator size="4" />
                        <Text size="2" weight="medium">
                          Set default to
                        </Text>
                        <Flex direction="column" gap="2" align="stretch">
                          {memberships.map((m) => (
                            <Button
                              key={m.clientId}
                              type="button"
                              variant={prefs?.defaultClientId === m.clientId ? 'solid' : 'outline'}
                              disabled={saving}
                              onClick={() => setDefaultClient(m.clientId)}
                            >
                              {m.name}
                              <Text size="1" color="gray" as="span" ml="2">
                                ({m.role})
                              </Text>
                            </Button>
                          ))}
                        </Flex>
                      </>
                    ) : (
                      <Text size="2" color="gray">
                        Join or create a client first (workspace hub).
                      </Text>
                    )}

                    <Separator size="4" />

                    <Flex align="center" gap="3" wrap="wrap">
                      <Checkbox
                        id="prefs-skip-hub"
                        checked={prefs?.skipHubWhenDefaultAvailable ?? false}
                        disabled={saving || !prefs?.defaultClientId}
                        onCheckedChange={(v) => toggleSkipHub(v === true)}
                      />
                      <Text as="label" htmlFor="prefs-skip-hub" size="2" color="gray" style={{ flex: 1 }}>
                        Skip workspace hub on sign-in when this default is available
                      </Text>
                    </Flex>
                    {!prefs?.defaultClientId ? (
                      <Text size="1" color="gray">
                        Set a default client above to enable this option.
                      </Text>
                    ) : null}
                  </Flex>
                )}
              </>
            ) : null}
          </div>
        </div>

        <Flex justify="end" gap="2" mt="4">
          <Dialog.Close>
            <Button type="button" variant="soft">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
