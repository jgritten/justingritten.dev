import { DropdownMenu, Avatar, Text } from '@radix-ui/themes'
import { useIsDarkTheme } from '@/contexts/ThemeContext'
import { useSaasClient } from '@/contexts/SaasClientContext'
import './MenuBar.css'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'

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
}

export function MenuBar({ onOpenThemeSettings, onOpenSidebar, scrolled }: MenuBarProps) {
  const isDark = useIsDarkTheme()
  const faviconSrc = isDark ? '/favicon_white.png' : '/favicon.png'
  const { activeClient } = useSaasClient()

  const logoSrc = activeClient?.logoUrl ?? faviconSrc
  const title = activeClient ? `${activeClient.name} – Dashboard` : 'Dashboard'

  return (
    <header
      className={`menu-bar${scrolled ? ' menu-bar--scrolled' : ''}`}
      role="banner"
    >
      <div className="menu-bar__brand">
        <button
          type="button"
          className="menu-bar__logo menu-bar__logo--desktop"
          aria-label={activeClient?.name ?? 'SaaS logo'}
        >
          <img
            src={logoSrc}
            alt={activeClient?.name ?? 'SaaS logo'}
            className="menu-bar__favicon"
            width={28}
            height={28}
          />
        </button>
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
      </div>
    </header>
  )
}
