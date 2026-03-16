import { NavLink } from 'react-router-dom'
import { Tooltip } from '@radix-ui/themes'
import { useIsDarkTheme, useTheme } from '@/contexts/ThemeContext'
import './MenuBar.css'

export function GlobalMenuBar() {
  const isDark = useIsDarkTheme()
  const { setTheme } = useTheme()

  const toggleAppearance = () => {
    const nextAppearance = isDark ? 'light' : 'dark'
    setTheme({ appearance: nextAppearance })
  }

  const tabClassName = ({ isActive }: { isActive: boolean }) =>
    `menu-bar__tab${isActive ? ' menu-bar__tab--active' : ''}`

  return (
    <header className="menu-bar" role="banner">
      <div className="menu-bar__brand">
        <NavLink
          to="/"
          className="menu-bar__logo menu-bar__logo--desktop"
          aria-label="Home"
        >
          <img
            src="/icons/canada.svg"
            alt="Canadian flag"
            className="menu-bar__favicon"
            width={48}
            height={36}
          />
        </NavLink>
      </div>
      <div className="menu-bar__center">
        <nav className="menu-bar__tabs" aria-label="Primary sections">
          <NavLink to="/" end className={tabClassName}>
            Profile
          </NavLink>
          <NavLink to="/saas" className={tabClassName}>
            SaaS
          </NavLink>
          <span className="menu-bar__tabs-divider" aria-hidden="true" />
          <NavLink to="/build" className={tabClassName}>
            Build & Activity
          </NavLink>
        </nav>
      </div>
      <div className="menu-bar__user">
        <Tooltip content="Toggle theme between light and dark">
          <button
            type="button"
            className="menu-bar__theme-toggle"
            aria-label="Toggle theme between light and dark"
            onClick={toggleAppearance}
          >
            {isDark ? (
              <span aria-hidden className="menu-bar__theme-icon">
                {/* Moon icon when currently dark (click to go light) */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            ) : (
              <span aria-hidden className="menu-bar__theme-icon">
                {/* Sun icon when currently light (click to go dark) */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
                  <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
                  <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
                </svg>
              </span>
            )}
          </button>
        </Tooltip>
      </div>
    </header>
  )
}

