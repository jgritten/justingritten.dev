import { describe, it, expect } from 'vitest'
import { defaultSidebarConfig } from './sidebarConfig'

describe('sidebarConfig', () => {
  it('has main list with Dashboard, divider, Create New, Search', () => {
    const main = defaultSidebarConfig.main
    expect(main).toHaveLength(4)

    const dashboard = main[0]
    expect(dashboard).toMatchObject({
      type: 'link',
      id: 'dashboard',
      label: 'Dashboard',
      to: '/',
    })

    expect(main[1]).toMatchObject({ type: 'divider' })

    expect(main[2]).toMatchObject({
      type: 'action',
      id: 'create-new',
      label: 'Create New',
      action: 'openCreateNew',
    })

    expect(main[3]).toMatchObject({
      type: 'action',
      id: 'search',
      label: 'Search',
      action: 'openSearch',
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
