import { DropdownMenu, Text } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'
import { useSaasClient } from '@/contexts/SaasClientContext'
import type { TenantWorkspaceState } from '@/hooks/useTenantWorkspace'

type Props = TenantWorkspaceState

/**
 * Client switch dropdown body when Clerk + tenancy API are active.
 */
export function ClerkTenantClientSwitchMenuContent({ workspace, loading, error, refresh }: Props) {
  const navigate = useNavigate()
  const { activeClient, setActiveClient } = useSaasClient()

  const memberships = workspace?.memberships ?? []
  const activeId = activeClient?.id

  const switchTo = (clientId: string, name: string) => {
    setActiveClient({ id: clientId, name })
    navigate('/saas/dashboard', { replace: true })
  }

  const others = memberships.filter((m) => m.clientId !== activeId)
  const current = memberships.find((m) => m.clientId === activeId)

  return (
    <>
      <DropdownMenu.Label>Active client</DropdownMenu.Label>
      {loading ? (
        <DropdownMenu.Item disabled>
          <Text size="2" color="gray">
            Loading…
          </Text>
        </DropdownMenu.Item>
      ) : error ? (
        <DropdownMenu.Item disabled>
          <Text size="2" color="red">
            {error}
          </Text>
        </DropdownMenu.Item>
      ) : (
        <DropdownMenu.Item disabled>
          <Text size="2">
            {current?.name ?? activeClient?.name ?? 'No tenant selected'}
          </Text>
          {current ? (
            <Text size="1" color="gray" as="div">
              {current.role}
            </Text>
          ) : null}
        </DropdownMenu.Item>
      )}
      {others.length > 0 ? (
        <>
          <DropdownMenu.Separator />
          <DropdownMenu.Label>Switch to</DropdownMenu.Label>
          {others.map((m) => (
            <DropdownMenu.Item key={m.clientId} onSelect={() => switchTo(m.clientId, m.name)}>
              {m.name}
              <Text size="1" color="gray" as="div">
                {m.role}
              </Text>
            </DropdownMenu.Item>
          ))}
        </>
      ) : !loading && !error && memberships.length <= 1 ? (
        <>
          <DropdownMenu.Separator />
          <DropdownMenu.Item disabled>
            <Text size="2" color="gray">
              Create another client from the workspace hub to switch between organizations.
            </Text>
          </DropdownMenu.Item>
        </>
      ) : null}
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        onSelect={() => {
          void refresh()
        }}
      >
        Refresh list
      </DropdownMenu.Item>
    </>
  )
}
