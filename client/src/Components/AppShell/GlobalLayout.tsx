import { Outlet } from 'react-router-dom'
import { GlobalMenuBar } from './GlobalMenuBar'
import { Footer } from './Footer'
import { RouteVisitTracker } from './RouteVisitTracker'
import { SiteVersionWatcher } from './SiteVersionWatcher'
import './AppShell.css'

export function GlobalLayout() {
  return (
    <div className="app-shell">
      <SiteVersionWatcher />
      <RouteVisitTracker />
      <GlobalMenuBar />
      <div className="app-shell__main">
        <main className="app-shell__content" id="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

