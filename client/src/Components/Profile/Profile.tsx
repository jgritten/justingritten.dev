import { WelcomeWidget } from '../Dashboard/widgets/WelcomeWidget'
import { TechWheelhouse } from './TechWheelhouse'
import { ContactCard } from './ContactCard'
import '../Dashboard/Dashboard.css'

export function Profile() {
  return (
    <div className="dashboard">
      <div
        id="profile-welcome"
        data-profile-section="welcome"
        className="content-card"
      >
        <WelcomeWidget />
      </div>
      <div
        id="profile-tech-wheelhouse"
        data-profile-section="tech-wheelhouse"
        className="content-card content-card--wide"
      >
        <TechWheelhouse />
      </div>
      <div
        id="profile-contact"
        data-profile-section="contact"
        className="content-card"
      >
        <ContactCard />
      </div>
    </div>
  )
}


