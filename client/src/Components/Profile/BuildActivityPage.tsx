import { CICDWidget } from '../Dashboard/widgets/CICDWidget'
import { RoadmapWidget } from '../Dashboard/widgets/RoadmapWidget'
import { RecentActivityWidget } from '../Dashboard/widgets/RecentActivityWidget'
import '../Dashboard/Dashboard.css'

export function BuildActivityPage() {
  return (
    <div className="dashboard">
      <div className="content-card">
        <CICDWidget />
      </div>
      <div className="content-card">
        <RoadmapWidget />
      </div>
      <div className="content-card">
        <RecentActivityWidget />
      </div>
    </div>
  )
}

