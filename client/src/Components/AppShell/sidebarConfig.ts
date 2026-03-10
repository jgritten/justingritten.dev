/**
 * Sidebar configuration: main (top) and bottom lists.
 * Items can be links, action buttons, or dividers.
 */

export interface SidebarSubMenuItem {
  id: string
  label: string
  to?: string
  end?: boolean
  action?: string
  icon?: string
  dividerBefore?: boolean
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

export interface SidebarGroupHeaderItem {
  type: 'groupHeader'
  id: string
  label: string
}

export type SidebarMainItem =
  | SidebarLinkItem
  | SidebarActionItem
  | SidebarDividerItem
  | SidebarGroupHeaderItem

export interface SidebarConfig {
  main: SidebarMainItem[]
  bottom: SidebarMainItem[]
}

export const defaultSidebarConfig: SidebarConfig = {
  main: [
    {
      type: 'link',
      id: 'profile',
      label: 'Profile',
      icon: 'document',
      to: '/',
      end: true,
    },
    { type: 'divider' },
    {
      type: 'groupHeader',
      id: 'demo-apps-header',
      label: 'Demo Applications',
    },
    {
      type: 'link',
      id: 'saas',
      label: 'SaaS',
      icon: 'saas',
      to: '/saas',
      subMenu: {
        header: 'SaaS',
        items: [
          {
            id: 'saas-dashboard',
            label: 'Dashboard',
            to: '/saas/dashboard',
            end: true,
            icon: 'dashboard',
          },
          {
            id: 'saas-create',
            label: 'Create New',
            action: 'openCreateNew',
            icon: 'createNew',
            dividerBefore: true,
          },
          {
            id: 'saas-search',
            label: 'Search',
            action: 'openSearch',
            icon: 'search',
          },
        ],
      },
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
