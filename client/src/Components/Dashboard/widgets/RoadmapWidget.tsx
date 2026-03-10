import { Heading, Text } from '@radix-ui/themes'
import './RoadmapWidget.css'

/** Roadmap phases derived from docs/roadmap.md. Phase 0 is complete; others are planned or in progress. */
const ROADMAP_PHASES = [
  {
    id: 'phase-0',
    title: 'Phase 0: Foundation',
    completed: true,
    items: [
      'Guest as default entry; viewable without login',
      'App shell and layout (menu bar, sidebar, content); Dashboard default',
      'Placeholder modals: Create New, Search',
      'Settings (sidebar sub-menu + placeholder pages)',
      'Theme persistence + Theme settings modal',
      'Footer (favicon, Resume, LinkedIn, Email)',
      'Mobile: hamburger, slide-out sidebar, two-column settings',
    ],
  },
  {
    id: 'phase-1',
    title: 'Phase 1: SaaS - Authentication',
    completed: false,
    items: [
      'Guest session (explicit type; default client; upgrade path to sign up / log in)',
      'Username/password login (API + client; JWT or session)',
      'Account Settings and Application Settings + Logout in dropdown',
      'Full Radix theming persisting between sessions',
      'Roles: SaaS roles (User, Support, Admin) and client roles',
      'Login path trigger (post-login: no client vs invited vs returning)',
      'Email verification (optional); third-party login (Google, etc.)',
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2: SaaS - Tenancy (clients)',
    completed: false,
    items: [
      'Client (tenant) entity and API',
      'Login path flows: first-time (wizard or accept invitation), returning (choose client or direct)',
      'Current client context; multi-client and switch client',
      'Authorization on data access; shared data per client; client admin',
      'Client default theme; support impersonation and data manipulation',
      'Soft delete; audit log; document generation (template + microserver, rate limit)',
      'Document packages (scheduled/bulk); version/revision history; file validation; email notifications',
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3: SaaS - Realtime and notifications',
    completed: false,
    items: [
      'WebSocket (server + client; auth-aware)',
      'Support messaging (to user or all users of a client)',
      'Notifications: small alerts, icon + history, full-page modal',
      'Global search modal (client-scoped; support cross-client)',
      'Create New modal wizard',
      'Dashboard activity + Ready at a Glance; Test results widget',
      'Configurable dashboard; offline / graceful degradation',
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4: SaaS - Polish and extra features',
    completed: false,
    items: [
      'Onboarding tour (highlighted sections)',
      'Billing/charge UX (integrated or demo)',
      'Branding placement (e.g. client name to top of sidebar)',
      'Bulk actions (multi-select where applicable)',
    ],
  },
  {
    id: 'phase-5',
    title: 'Phase 5: SaaS - Later / learning-focused',
    completed: false,
    items: [
      'Help widget → AI chat (docs-aware)',
      '2FA (optional); configurable fields (revisit when objects defined)',
      'API keys not planned at this stage',
    ],
  },
] as const

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable={false}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function RoadmapWidget() {
  return (
    <div className="roadmap-widget" aria-label="Feature roadmap">
      <header className="roadmap-widget__header">
        <Heading as="h2" size="6" weight="bold" className="roadmap-widget__title">
          Roadmap
        </Heading>
        <Text as="p" size="2" color="gray" className="roadmap-widget__subtitle">
          A portfolio site showcasing SaaS functionality in a simulated commercial environment.
        </Text>
        <Text as="p" size="1" color="gray" className="roadmap-widget__tagline">
          Implementation phases
        </Text>
      </header>

      <ol className="roadmap-widget__timeline" role="list">
        {ROADMAP_PHASES.map((phase) => (
          <li
            key={phase.id}
            className="roadmap-widget__phase"
            data-phase={phase.id}
            data-completed={phase.completed}
          >
            <span
              className="roadmap-widget__node"
              aria-label={phase.completed ? 'Phase complete' : undefined}
              data-completed={phase.completed}
            >
              {phase.completed ? <CheckIcon /> : null}
            </span>
            <div className="roadmap-widget__card" data-completed={phase.completed}>
              <Heading as="h3" size="4" weight="bold" className="roadmap-widget__phase-title">
                {phase.title}
                {phase.completed ? (
                  <span className="roadmap-widget__badge" aria-label="Completed">Done</span>
                ) : null}
              </Heading>
              <ul className="roadmap-widget__items" role="list">
                {phase.items.map((item, i) => (
                  <li key={i} className="roadmap-widget__item">
                    <Text as="span" size="2" color="gray">
                      {item}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
