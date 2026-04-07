import { describe, it, expect } from 'vitest'
import { defaultSidebarConfig, saasSidebarConfig } from './sidebarConfig'

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
    const bottom = saasSidebarConfig.bottom
    expect(bottom).toHaveLength(1)

    const settings = bottom[0] as {
      type: string
      id: string
      label: string
      to: string
      subMenu?: { header: string; items: unknown[] }
    }

    expect(settings).toMatchObject({
      type: 'link',
      id: 'saas-settings',
      label: 'Settings',
      to: '/saas/settings',
    })
    expect(settings).toHaveProperty('subMenu')
    expect(settings.subMenu).toMatchObject({
      header: 'Settings',
      items: [
        { id: 'saas-settings-account', label: 'Account', to: '/saas/settings/account' },
        { id: 'saas-settings-application', label: 'Application', to: '/saas/settings/application' },
        { id: 'saas-settings-client', label: 'Client', to: '/saas/settings/client' },
        { id: 'saas-settings-users', label: 'Users', to: '/saas/settings/users' },
      ],
    })
  })
})
