import { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { MenuBar } from '../AppShell/MenuBar'
import { Sidebar } from '../AppShell/Sidebar'
import { CreateNewModal } from '../AppShell/CreateNewModal'
import { SearchModal } from '../AppShell/SearchModal'
import { saasSidebarConfig } from '../AppShell/sidebarConfig'
import { saasClerkPublishableKey } from '@/utils/saasClerk'
import { SaasClerkUserMenu } from './SaasClerkUserMenu'
import '../AppShell/AppShell.css'

const SCROLL_THRESHOLD = 16

export function SaasAppShell() {
  const [createNewOpen, setCreateNewOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuBarScrolled, setMenuBarScrolled] = useState(false)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkScroll = () => {
      const contentScroll = contentRef.current?.scrollTop ?? 0
      const windowScroll = window.scrollY
      setMenuBarScrolled(contentScroll > SCROLL_THRESHOLD || windowScroll > SCROLL_THRESHOLD)
    }
    const content = contentRef.current
    content?.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
    return () => {
      content?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('scroll', checkScroll)
    }
  }, [])

  return (
    <div className="saas-shell">
      <MenuBar
        onOpenSidebar={() => setSidebarOpen(true)}
        scrolled={menuBarScrolled}
        userMenu={saasClerkPublishableKey ? <SaasClerkUserMenu /> : undefined}
        clerkTenancyEnabled={Boolean(saasClerkPublishableKey)}
      />
      <div className="saas-shell__main">
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            role="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          />
        )}
        <Sidebar
          config={saasSidebarConfig}
          mobileOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          actions={{
            openCreateNew: () => {
              setCreateNewOpen(true)
              setSidebarOpen(false)
            },
            openSearch: () => {
              setSearchOpen(true)
              setSidebarOpen(false)
            },
          }}
        />
        <main className="saas-shell__content" id="saas-main-content" ref={contentRef}>
          <Outlet />
        </main>
      </div>
      <CreateNewModal open={createNewOpen} onOpenChange={setCreateNewOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

