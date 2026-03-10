import { useState, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { MenuBar } from './MenuBar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { CreateNewModal } from './CreateNewModal'
import { SearchModal } from './SearchModal'
import { ThemeSettingsModal } from './ThemeSettingsModal'
import './AppShell.css'

const SCROLL_THRESHOLD = 16

export function AppShell() {
  const [createNewOpen, setCreateNewOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [themeSettingsOpen, setThemeSettingsOpen] = useState(false)
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
    <div className="app-shell">
      <MenuBar
        onOpenThemeSettings={() => setThemeSettingsOpen(true)}
        onOpenSidebar={() => setSidebarOpen(true)}
        scrolled={menuBarScrolled}
      />
      <div className="app-shell__main">
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
        <main className="app-shell__content" id="main-content" ref={contentRef}>
          <Outlet />
        </main>
      </div>
      <Footer />
      <CreateNewModal open={createNewOpen} onOpenChange={setCreateNewOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <ThemeSettingsModal
        open={themeSettingsOpen}
        onOpenChange={setThemeSettingsOpen}
      />
    </div>
  )
}
