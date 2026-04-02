import type { ReactNode } from 'react'
import { DropdownMenu, Avatar, Text } from '@radix-ui/themes'
import { useSaasClient } from '@/contexts/SaasClientContext'
import { SAAS_GUEST_CLIENT_PLACEHOLDER_LOGO } from '@/utils/saasClientAssets'
import { useTenantWorkspace } from '@/hooks/useTenantWorkspace'
import { ClerkTenantClientSwitchMenuContent } from '@/Components/SaaS/ClerkTenantClientSwitchMenu'
import './MenuBar.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'

function GuestClientSwitchDropdownContent() {
  const { activeClient } = useSaasClient()
  const label = activeClient?.name ?? 'Guest Client'

  return (
    <>
      <DropdownMenu.Label>Active client</DropdownMenu.Label>
      <DropdownMenu.Item disabled>{label}</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item disabled>
        Switch client — appears when you belong to more than one organization
      </DropdownMenu.Item>
    </>
  )
}

function ClientLogoMenuWithClerk({ className }: { className: string }) {
  const { activeClient } = useSaasClient()
  const tenant = useTenantWorkspace()
  const clientLabel = activeClient?.name ?? 'Guest Client'
  const logoSrc = activeClient?.logoUrl ?? SAAS_GUEST_CLIENT_PLACEHOLDER_LOGO
  const isPlaceholder = !activeClient?.logoUrl

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (open) void tenant.refresh()
      }}
    >
      <DropdownMenu.Trigger>
        <button
          type="button"
          className={className}
          aria-label={`Client menu, ${clientLabel}`}
        >
          <img
            src={logoSrc}
            alt={isPlaceholder ? 'No client selected' : ''}
            className={
              isPlaceholder
                ? 'menu-bar__favicon menu-bar__favicon--client-placeholder-banner'
                : 'menu-bar__favicon'
            }
            width={isPlaceholder ? undefined : 28}
            height={28}
            {...(isPlaceholder ? {} : { 'aria-hidden': true })}
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="menu-bar__dropdown">
        <ClerkTenantClientSwitchMenuContent {...tenant} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ClientLogoMenuGuest({ className }: { className: string }) {
  const { activeClient } = useSaasClient()
  const clientLabel = activeClient?.name ?? 'Guest Client'
  const logoSrc = activeClient?.logoUrl ?? SAAS_GUEST_CLIENT_PLACEHOLDER_LOGO
  const isPlaceholder = !activeClient?.logoUrl

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button
          type="button"
          className={className}
          aria-label={`Client menu, ${clientLabel}`}
        >
          <img
            src={logoSrc}
            alt={isPlaceholder ? 'No client selected' : ''}
            className={
              isPlaceholder
                ? 'menu-bar__favicon menu-bar__favicon--client-placeholder-banner'
                : 'menu-bar__favicon'
            }
            width={isPlaceholder ? undefined : 28}
            height={28}
            {...(isPlaceholder ? {} : { 'aria-hidden': true })}
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="menu-bar__dropdown">
        <GuestClientSwitchDropdownContent />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function ClientLogoMenu({
  className,
  clerkTenancyEnabled,
}: {
  className: string
  clerkTenancyEnabled?: boolean
}) {
  if (clerkTenancyEnabled) {
    return <ClientLogoMenuWithClerk className={className} />
  }
  return <ClientLogoMenuGuest className={className} />
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

type MenuBarProps = {
  onOpenThemeSettings?: () => void
  onOpenSidebar?: () => void
  /** When true (e.g. user has scrolled), menu bar can show a solid background (mobile only). */
  scrolled?: boolean
  /** Replaces the default Guest user dropdown (e.g. Clerk `<UserButton />` on SaaS). */
  userMenu?: ReactNode
  /** When true, client menu loads tenancy workspace (requires `ClerkProvider`). */
  clerkTenancyEnabled?: boolean
}

export function MenuBar({
  onOpenThemeSettings,
  onOpenSidebar,
  scrolled,
  userMenu,
  clerkTenancyEnabled,
}: MenuBarProps) {
  const { activeClient } = useSaasClient()

  const title = activeClient ? `${activeClient.name} – Dashboard` : 'Dashboard'

  return (
    <header
      className={`menu-bar${scrolled ? ' menu-bar--scrolled' : ''}`}
      role="banner"
    >
      <div className="menu-bar__brand">
        <ClientLogoMenu
          className="menu-bar__logo menu-bar__logo--desktop"
          clerkTenancyEnabled={clerkTenancyEnabled}
        />
        <ClientLogoMenu
          className="menu-bar__logo menu-bar__client-trigger--mobile"
          clerkTenancyEnabled={clerkTenancyEnabled}
        />
        {onOpenSidebar && (
          <button
            type="button"
            className="menu-bar__hamburger menu-bar__hamburger--mobile"
            onClick={onOpenSidebar}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
        )}
      </div>
      <div className="menu-bar__center">
        <span className="menu-bar__title">{title}</span>
      </div>
      <div className="menu-bar__user">
        {userMenu ?? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button
                type="button"
                className="menu-bar__trigger"
                aria-label="User menu"
              >
                <Avatar
                  size="2"
                  radius="full"
                  fallback="G"
                  color="gray"
                />
                <Text size="2" color="gray" className="menu-bar__label">
                  Guest
                </Text>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="menu-bar__dropdown">
              <DropdownMenu.Label>Signed in as Guest</DropdownMenu.Label>
              <DropdownMenu.Separator />
              {onOpenThemeSettings && (
                <DropdownMenu.Item onSelect={onOpenThemeSettings}>
                  Theme settings
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item disabled>
                Sign in
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View source on GitHub
                </a>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  )
}
