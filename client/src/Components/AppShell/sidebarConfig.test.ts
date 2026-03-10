import { describe, it, expect } from 'vitest'
import { defaultSidebarConfig } from './sidebarConfig'

describe('sidebarConfig', () => {
  it('has main list with Profile and SaaS demo menu', () => {
    const main = defaultSidebarConfig.main
    expect(main).toHaveLength(4)

    const profile = main[0]
    expect(profile).toMatchObject({
      type: 'link',
      id: 'profile',
      label: 'Profile',
      to: '/',
    })

    expect(main[1]).toMatchObject({ type: 'divider' })

    expect(main[2]).toMatchObject({
      type: 'groupHeader',
      id: 'demo-apps-header',
      label: 'Demo Applications',
    })

    const saas = main[3] as { subMenu?: { header: string; items: unknown[] } }
    expect(saas).toMatchObject({
      type: 'link',
      id: 'saas',
      label: 'SaaS',
      to: '/saas',
    })
    expect(saas).toHaveProperty('subMenu')
    expect(saas.subMenu).toMatchObject({
      header: 'SaaS',
      items: [
        {
          id: 'saas-dashboard',
          label: 'Dashboard',
          to: '/saas/dashboard',
          end: true,
        },
        {
          id: 'saas-create',
          label: 'Create New',
          action: 'openCreateNew',
        },
        {
          id: 'saas-search',
          label: 'Search',
          action: 'openSearch',
        },
      ],
    })
  })

  it('has bottom list with Settings and sub-menu', () => {
    const bottom = defaultSidebarConfig.bottom
    expect(bottom).toHaveLength(1)

    const settings = bottom[0]
    expect(settings).toMatchObject({
      type: 'link',
      id: 'settings',
      label: 'Settings',
      to: '/settings',
    })
    expect(settings).toHaveProperty('subMenu')
    expect((settings as { subMenu: { header: string; items: unknown[] } }).subMenu).toMatchObject({
      header: 'Settings',
      items: [
        { id: 'account', label: 'Account', to: '/settings/account' },
        { id: 'application', label: 'Application', to: '/settings/application' },
        { id: 'client', label: 'Client', to: '/settings/client' },
      ],
    })
  })
})
