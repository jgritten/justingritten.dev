import { NavLink, useLocation } from 'react-router-dom'
import { Text } from '@radix-ui/themes'
import {
  IconDashboard,
  IconSpreadsheet,
  IconDocument,
  IconCreateNew,
  IconSearch,
  IconSettings,
  IconSaasCloud,
} from './SidebarIcons'
import {
  defaultSidebarConfig,
  type SidebarConfig,
  type SidebarLinkItem,
  type SidebarMainItem,
} from './sidebarConfig'
import { PROFILE_WIDGETS } from '../Profile/Profile'
import './Sidebar.css'

const ICON_MAP = {
  dashboard: IconDashboard,
  spreadsheet: IconSpreadsheet,
  document: IconDocument,
  createNew: IconCreateNew,
  search: IconSearch,
  settings: IconSettings,
  saas: IconSaasCloud,
} as const

type IconKey = keyof typeof ICON_MAP

export type SidebarActions = {
  openCreateNew?: () => void
  openSearch?: () => void
}

type SidebarProps = {
  config?: SidebarConfig
  actions?: SidebarActions
  mobileOpen?: boolean
  onCloseSidebar?: () => void
  onProfileSectionSelect?: (sectionId: string) => void
}

function isLinkItem(item: SidebarMainItem): item is SidebarLinkItem {
  return item.type === 'link'
}

export function Sidebar({
  config = defaultSidebarConfig,
  actions = {},
  mobileOpen = false,
  onCloseSidebar,
  onProfileSectionSelect,
}: SidebarProps) {
  const { pathname } = useLocation()
  const activeItemWithSub = config.main.concat(config.bottom).find(
    (item): item is SidebarLinkItem =>
      isLinkItem(item) && !!item.subMenu && pathname.startsWith(item.to)
  )
  const inSubMenu = !!activeItemWithSub

  const mainLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar__sublink ${isActive ? 'sidebar__sublink--active' : ''}`

  const renderIcon = (iconKey: string) => {
    const Icon = ICON_MAP[iconKey as IconKey]
    if (!Icon) return null
    return (
      <span className="sidebar__icon" aria-hidden>
        <Icon />
      </span>
    )
  }

  const renderMainItem = (item: SidebarMainItem, index: number) => {
    if (item.type === 'divider') {
      return (
        <li key={`divider-${index}`} className="sidebar__divider-wrapper" role="separator">
          <hr className="sidebar__divider" />
        </li>
      )
    }
    if (item.type === 'groupHeader') {
      return (
        <li key={item.id} className="sidebar__group-header">
          <Text size="1" weight="bold" color="gray">
            {item.label}
          </Text>
        </li>
      )
    }
    if (item.type === 'link') {
      /* On mobile: keep sidebar open when switching between main view and settings view (Dashboard, Settings); close when navigating to a specific page. */
      const closeOnClick =
        onCloseSidebar &&
        item.to !== '/' &&
        item.to !== '/settings'
      return (
        <li key={item.id}>
          <NavLink
            to={item.to}
            end={item.end ?? false}
            className={mainLinkClass}
            title={item.label}
            onClick={closeOnClick ? onCloseSidebar : undefined}
          >
            {renderIcon(item.icon)}
            <span className="sidebar__label">
              <Text size="2">{item.label}</Text>
            </span>
          </NavLink>
          {item.id === 'profile' && (
            <ul className="sidebar__profile-submenu" aria-label="Profile sections">
              {PROFILE_WIDGETS.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className="sidebar__sublink sidebar__sublink--profile"
                    onClick={() => {
                      onProfileSectionSelect?.(section.id)
                      onCloseSidebar?.()
                    }}
                  >
                    <Text size="1">{section.label}</Text>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      )
    }
    const handler = item.action ? actions[item.action as keyof SidebarActions] : undefined
    return (
      <li key={item.id}>
        <button
          type="button"
          className="sidebar__link sidebar__button"
          onClick={() => {
            handler?.()
            onCloseSidebar?.()
          }}
          title={item.label}
        >
          {renderIcon(item.icon)}
          <span className="sidebar__label">
            <Text size="2">{item.label}</Text>
          </span>
        </button>
      </li>
    )
  }

  const wrapperClass = [
    'sidebar-wrapper',
    inSubMenu ? 'sidebar-wrapper--settings' : '',
    mobileOpen ? 'sidebar-wrapper--mobile-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      <nav
        className="sidebar__main"
        aria-label={inSubMenu ? 'Main navigation (icons)' : 'Main navigation'}
      >
        <ul className="sidebar__list">
          {config.main.map((item, index) => renderMainItem(item, index))}
        </ul>
        <ul className="sidebar__list sidebar__list--bottom">
          {config.bottom.map((item, index) => renderMainItem(item, index))}
        </ul>
      </nav>
      {activeItemWithSub?.subMenu && (
        <nav
          className="sidebar__sub"
          aria-label={activeItemWithSub.subMenu.header}
          aria-hidden={!inSubMenu}
        >
          <h2 className="sidebar__subheader">{activeItemWithSub.subMenu.header}</h2>
          <hr className="sidebar__subdivider" />
          <ul className="sidebar__sublist">
            {activeItemWithSub.subMenu.items.map((sub) => (
              <li key={sub.id}>
                {sub.dividerBefore && (
                  <hr className="sidebar__subdivider sidebar__subdivider--inner" />
                )}
                {sub.action ? (
                  <button
                    type="button"
                    className="sidebar__sublink"
                    onClick={() => {
                      const handler = actions[sub.action as keyof SidebarActions]
                      handler?.()
                      onCloseSidebar?.()
                    }}
                  >
                    {sub.icon && renderIcon(sub.icon)}
                    <Text size="2">{sub.label}</Text>
                  </button>
                ) : (
                  <NavLink
                    to={sub.to ?? ''}
                    end={sub.end ?? false}
                    className={subLinkClass}
                    onClick={onCloseSidebar}
                  >
                    {sub.icon && renderIcon(sub.icon)}
                    <Text size="2">{sub.label}</Text>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
