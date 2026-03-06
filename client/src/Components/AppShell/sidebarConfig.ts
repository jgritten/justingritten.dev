/**
 * Sidebar configuration: main (top) and bottom lists.
 * Items can be links, action buttons, or dividers.
 */

export interface SidebarSubMenuItem {
  id: string
  label: string
  to: string
  end?: boolean
}

export interface SidebarSubMenu {
  header: string
  items: SidebarSubMenuItem[]
}

export interface SidebarLinkItem {
  type: 'link'
  id: string
  label: string
  icon: string
  to: string
  end?: boolean
  subMenu?: SidebarSubMenu
}

export interface SidebarActionItem {
  type: 'action'
  id: string
  label: string
  icon: string
  action: string
}

export interface SidebarDividerItem {
  type: 'divider'
}

export type SidebarMainItem =
  | SidebarLinkItem
  | SidebarActionItem
  | SidebarDividerItem

export interface SidebarConfig {
  main: SidebarMainItem[]
  bottom: SidebarMainItem[]
}

export const defaultSidebarConfig: SidebarConfig = {
  main: [
    {
      type: 'link',
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      to: '/',
      end: true,
    },
    { type: 'divider' },
    {
      type: 'action',
      id: 'create-new',
      label: 'Create New',
      icon: 'createNew',
      action: 'openCreateNew',
    },
    {
      type: 'action',
      id: 'search',
      label: 'Search',
      icon: 'search',
      action: 'openSearch',
    },
  ],
  bottom: [
    {
      type: 'link',
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      to: '/settings',
      end: false,
      subMenu: {
        header: 'Settings',
        items: [
          { id: 'account', label: 'Account', to: '/settings/account', end: true },
          { id: 'application', label: 'Application', to: '/settings/application' },
          { id: 'client', label: 'Client', to: '/settings/client' },
        ],
      },
    },
  ],
}
