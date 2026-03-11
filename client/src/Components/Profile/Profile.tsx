import { WelcomeWidget } from '../Dashboard/widgets/WelcomeWidget'
import { CICDWidget } from '../Dashboard/widgets/CICDWidget'
import { RoadmapWidget } from '../Dashboard/widgets/RoadmapWidget'
import { RecentActivityWidget } from '../Dashboard/widgets/RecentActivityWidget'
import '../Dashboard/Dashboard.css'

export const PROFILE_WIDGETS = [
  { id: 'welcome', anchorId: 'profile-welcome', label: 'Welcome', Component: WelcomeWidget },
  { id: 'cicd', anchorId: 'profile-cicd', label: 'How this site is built', Component: CICDWidget },
  { id: 'roadmap', anchorId: 'profile-roadmap', label: 'Roadmap', Component: RoadmapWidget },
  {
    id: 'recent-activity',
    anchorId: 'profile-recent-activity',
    label: 'Recent activity',
    Component: RecentActivityWidget,
  },
] as const

export function Profile() {
  return (
    <div className="dashboard">
      {PROFILE_WIDGETS.map(({ id, anchorId, Component }) => (
        <div
          key={id}
          id={anchorId}
          data-profile-section={id}
          className="content-card"
        >
          <Component />
        </div>
      ))}
    </div>
  )
}


