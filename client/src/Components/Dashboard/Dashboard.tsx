import { WelcomeWidget } from './widgets/WelcomeWidget'
import './Dashboard.css'

/** Widgets that can be shown on the dashboard. When enable/disable is implemented, filter by user/client settings. */
const DASHBOARD_WIDGETS = [
  { id: 'welcome', Component: WelcomeWidget },
] as const

export function Dashboard() {
  return (
    <div className="dashboard">
      {DASHBOARD_WIDGETS.map(({ id, Component }) => (
        <div key={id} className="content-card">
          <Component />
        </div>
      ))}
    </div>
  )
}
