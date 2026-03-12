import { Card, Flex, Heading, Text } from '@radix-ui/themes'
import type { ComponentType } from 'react'
import { useIsDarkTheme } from '@/contexts/ThemeContext'
import { DesignSystemsIcon } from './icons/DesignSystemsIcon'
import { DrawIoIcon } from './icons/DrawIoIcon'
import { PrototypingIcon } from './icons/PrototypingIcon'
import { RestApiIcon } from './icons/RestApiIcon'
import './TechWheelhouse.css'

type TechItem = {
  label: string
  iconSlug?: string
  iconUrl?: string
  /** Hex without # used when theme is light (light background). */
  colorLight?: string
  /** Hex without # used when theme is dark (dark background). */
  colorDark?: string
  /** Optional React icon component (takes optional className). */
  IconComponent?: ComponentType<{ className?: string }>
  /** Optional className for IconComponent (default: tag icon + --rest modifier). */
  iconClassName?: string
}

type TechCategory = {
  id: string
  title: string
  description: string
  items: TechItem[]
}

// Icon slugs from the Simple Icons CDN:
// See https://cdn.simpleicons.org/ and https://github.com/LitoMore/simple-icons-cdn
const CATEGORIES: TechCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    description: 'Modern, performant interfaces with strong UX and component systems.',
    items: [
      { label: 'JavaScript', iconSlug: 'javascript' },
      { label: 'TypeScript', iconSlug: 'typescript' },
      { label: 'React', iconSlug: 'react' },
      {
        label: 'Next.js',
        iconSlug: 'nextdotjs',
        colorLight: '000000',
        colorDark: 'ffffff',
      },
      {
        label: 'Angular',
        iconSlug: 'angular',
        colorLight: 'DD0031',
        colorDark: 'DD0031',
      },
      { label: 'React Native', iconSlug: 'react' },
      { label: 'Vite', iconSlug: 'vite' },
      {
        label: 'Radix UI',
        iconSlug: 'radixui',
        colorLight: '000000',
        colorDark: 'ffffff',
      },
      { label: 'Tailwind / utility CSS', iconSlug: 'tailwindcss' },
      { label: 'HTML5', iconSlug: 'html5' },
      { label: 'CSS3', iconUrl: '/icons/css.png' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Architecture',
    description: 'APIs, persistence, and infrastructure for SaaS-style products.',
    items: [
      { label: '.NET / ASP.NET', iconSlug: 'dotnet' },
      { label: 'Node.js', iconSlug: 'nodedotjs' },
      { label: 'MSSQL Server', iconUrl: '/icons/mssql.jpg' },
      { label: 'PostgreSQL', iconSlug: 'postgresql' },
      { label: 'RESTful APIs', IconComponent: RestApiIcon },
      { label: 'Background jobs' },
      // Custom AWS icon stored under client/public/icons
      { label: 'AWS (S3, Lambda, SQS, CloudFront)', iconUrl: '/icons/aws.svg' },
      { label: 'Azure', iconUrl: '/icons/azure.png' },
      { label: 'Docker', iconSlug: 'docker' },
    ],
  },
  {
    id: 'design',
    title: 'Design & UI/UX',
    description: 'Interfaces that feel consistent, intentional, and on-brand.',
    items: [
      { label: 'Figma', iconSlug: 'figma' },
      { label: 'Design systems', IconComponent: DesignSystemsIcon, iconClassName: 'tech-wheelhouse__tag-icon' },
      { label: 'Prototyping', IconComponent: PrototypingIcon, iconClassName: 'tech-wheelhouse__tag-icon tech-wheelhouse__tag-icon--prototyping' },
      { label: 'Responsive layouts', iconSlug: 'bootstrap' },
      { label: 'Draw.io', IconComponent: DrawIoIcon, iconClassName: 'tech-wheelhouse__tag-icon' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Ecosystem',
    description: 'Tooling that keeps delivery fast, observable, and maintainable.',
    items: [
      {
        label: 'Git & GitHub',
        iconSlug: 'github',
        colorLight: '181717',
        colorDark: 'ffffff',
      },
      {
        label: 'GitHub Actions',
        iconSlug: 'githubactions',
        colorLight: '2088FF',
        colorDark: '3fb950',
      },
      {
        label: 'Cursor / AI-assisted dev',
        iconSlug: 'cursor',
        colorLight: '3A4BFF',
        colorDark: 'ffffff',
      },
      { label: 'VS Code', iconUrl: '/icons/vscode.png' },
      { label: 'Visual Studio', iconUrl: '/icons/Visual_Studio_Icon.png' },
      { label: 'Postman', iconSlug: 'postman' },
      { label: 'Jira', iconSlug: 'jira' },
      {
        label: 'ChatGPT',
        iconUrl: '/icons/ChatGPT-Logo.png',
      },
      {
        label: 'Claude',
        iconUrl: '/icons/Claude_AI_symbol.png',
      },
      {
        label: 'GitHub Copilot',
        iconSlug: 'githubcopilot',
        colorLight: '00B3FF',
        colorDark: 'ffffff',
      },
      {
        label: 'Discord',
        iconSlug: 'discord',
        colorLight: '5865F2',
        colorDark: 'ffffff',
      },
      { label: 'Testing (Jest, Playwright, Vitest, RTL)', iconSlug: 'jest' },
    ],
  },
]

export function TechWheelhouse() {
  const isDark = useIsDarkTheme()

  return (
    <div className="tech-wheelhouse">
      <header className="tech-wheelhouse__header">
        <Heading as="h2" size="6" weight="bold">
          My Tech Wheelhouse
        </Heading>
        <Text as="p" size="2" color="gray">
          The stacks and tools I reach for when building production-grade products.
        </Text>
      </header>
      <div className="tech-wheelhouse__grid">
        {CATEGORIES.map((category) => (
          <section key={category.id} className="tech-wheelhouse__section">
            <header className="tech-wheelhouse__section-header">
              <Heading as="h3" size="4" weight="bold">
                {category.title}
              </Heading>
              <Text as="p" size="2" color="gray">
                {category.description}
              </Text>
            </header>
            <div className="tech-wheelhouse__items">
              {category.items.map((item) => (
                <Card key={item.label} className="tech-wheelhouse__item-card">
                  <Flex align="center" gap="3">
                    {item.IconComponent ? (
                      <item.IconComponent className={item.iconClassName ?? 'tech-wheelhouse__tag-icon tech-wheelhouse__tag-icon--rest'} />
                    ) : (
                      (item.iconUrl || item.iconSlug) && (
                        <img
                          src={
                            item.iconUrl
                              ? item.iconUrl
                              : (() => {
                                  const color =
                                    isDark
                                      ? item.colorDark ?? item.colorLight
                                      : item.colorLight ?? item.colorDark
                                  const colorSegment = color ? `/${color}` : ''
                                  return `https://cdn.simpleicons.org/${item.iconSlug}${colorSegment}?viewbox=auto&size=50`
                                })()
                          }
                          alt=""
                          className="tech-wheelhouse__tag-icon"
                        />
                      )
                    )}
                    <Text as="span" size="2">
                      {item.label}
                    </Text>
                  </Flex>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

