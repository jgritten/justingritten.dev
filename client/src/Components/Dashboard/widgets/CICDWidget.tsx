import { Heading, Text } from '@radix-ui/themes'
import {
  IconCursor,
  IconGitHub,
  IconGitHubActions,
  IconS3Squarespace,
} from './CICDWidgetIcons'
import './CICDWidget.css'

const STEP_ICONS = {
  cursor: IconCursor,
  github: IconGitHub,
  actions: IconGitHubActions,
  hosting: IconS3Squarespace,
} as const

const PIPELINE_STEPS = [
  {
    id: 'cursor',
    title: 'Cursor',
    description: 'Code is developed with Cursor using an AI agent as part of the workflow.',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Changes are committed and pushed to the repository.',
  },
  {
    id: 'actions',
    title: 'GitHub Actions',
    description:
      'On push to main (or manual run), workflows run client + server tests, build the SPA with production env vars, deploy frontend assets to S3 with CloudFront invalidation, and publish + deploy the API to Elastic Beanstalk with post-deploy health/event checks.',
  },
  {
    id: 'hosting',
    title: 'S3 + Squarespace',
    description:
      'Frontend is served from S3 behind CloudFront with Squarespace-managed DNS; the API runs on Elastic Beanstalk behind api.justingritten.dev.',
  },
] as const

export function CICDWidget() {
  return (
    <div className="cicd-widget" aria-label="CI/CD pipeline">
      <header className="cicd-widget__header">
        <Heading as="h2" size="6" weight="bold" className="cicd-widget__title">
          How this site is built
        </Heading>
        <Text as="p" size="2" color="gray" className="cicd-widget__subtitle">
          From code to production
        </Text>
      </header>

      <ol className="cicd-widget__pipeline" role="list">
        {PIPELINE_STEPS.map((step) => (
          <li
            key={step.id}
            className="cicd-widget__step"
            data-step={step.id}
          >
            <span className="cicd-widget__step-connector" aria-hidden />
            <div className="cicd-widget__step-card">
              <div className="cicd-widget__step-title-row">
                <span className="cicd-widget__step-icon" aria-hidden>
                  {(() => {
                    const Icon = STEP_ICONS[step.id]
                    return <Icon />
                  })()}
                </span>
                <Heading as="h3" size="4" weight="bold" className="cicd-widget__step-title">
                  {step.title}
                </Heading>
              </div>
              <Text as="p" size="2" color="gray" className="cicd-widget__step-desc">
                {step.description}
              </Text>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
