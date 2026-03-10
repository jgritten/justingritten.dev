import { WelcomeWidget } from '../Dashboard/widgets/WelcomeWidget'
import { CICDWidget } from '../Dashboard/widgets/CICDWidget'
import { RoadmapWidget } from '../Dashboard/widgets/RoadmapWidget'
import { RecentActivityWidget } from '../Dashboard/widgets/RecentActivityWidget'
import '../Dashboard/Dashboard.css'

const PROFILE_WIDGETS = [
  { id: 'welcome', Component: WelcomeWidget },
  { id: 'cicd', Component: CICDWidget },
  { id: 'roadmap', Component: RoadmapWidget },
  { id: 'recent-activity', Component: RecentActivityWidget },
] as const

export function Profile() {
  return (
    <div className="dashboard">
      {PROFILE_WIDGETS.map(({ id, Component }) => (
        <div key={id} className="content-card">
          <Component />
        </div>
      ))}
    </div>
  )
}

