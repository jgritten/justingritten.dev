import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WelcomeWidget } from './WelcomeWidget'

const GITHUB_REPO = 'https://github.com/jgritten/justingritten.dev'
const GITHUB_PROFILE = 'https://github.com/jgritten'

function WelcomeWidgetWithTheme() {
  return (
    <ThemeProvider>
      <WelcomeWidget />
    </ThemeProvider>
  )
}

describe('WelcomeWidget', () => {
  it('renders main heading and intro description', () => {
    render(<WelcomeWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: 'Justin Gritten', level: 1 })).toBeTruthy()
    expect(screen.getByText(/British Columbia, Canada/)).toBeTruthy()
    expect(screen.getByText(/full.stack developer/)).toBeTruthy()
  })

  it('renders About section with tagline', () => {
    render(<WelcomeWidgetWithTheme />)
    expect(screen.getByRole('region', { name: 'About' })).toBeTruthy()
    expect(
      screen.getByText(/I care about thoughtful UX, strong engineering fundamentals/)
    ).toBeTruthy()
  })

  it('has View source on GitHub link with correct href and opens in new tab', () => {
    render(<WelcomeWidgetWithTheme />)
    const sourceLink = screen.getByRole('link', { name: /view source on github/i })
    expect(sourceLink).toBeTruthy()
    expect(sourceLink.getAttribute('href')).toBe(GITHUB_REPO)
    expect(sourceLink.getAttribute('target')).toBe('_blank')
    expect(sourceLink.getAttribute('rel')).toMatch(/noopener/)
    expect(sourceLink.getAttribute('rel')).toMatch(/noreferrer/)
  })

  it('has View profile on GitHub link with correct href and opens in new tab', () => {
    render(<WelcomeWidgetWithTheme />)
    const profileLink = screen.getByRole('link', { name: /view profile on github/i })
    expect(profileLink).toBeTruthy()
    expect(profileLink.getAttribute('href')).toBe(GITHUB_PROFILE)
    expect(profileLink.getAttribute('target')).toBe('_blank')
    expect(profileLink.getAttribute('rel')).toMatch(/noopener/)
    expect(profileLink.getAttribute('rel')).toMatch(/noreferrer/)
  })

  it('renders stack line', () => {
    render(<WelcomeWidgetWithTheme />)
    expect(
      screen.getByText(/React · TypeScript · Vite · Radix UI · \.NET/)
    ).toBeTruthy()
  })
})
