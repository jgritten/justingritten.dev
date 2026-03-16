import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WelcomeWidget } from './WelcomeWidget'

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
    expect(screen.getByText(/Lake Country, BC/)).toBeTruthy()
    expect(screen.getByText(/Full.stack developer, crafting systems and design\./i)).toBeTruthy()
  })

  // Quick link buttons (GitHub profile, site repo) are exercised via accessible names and hrefs elsewhere.
})

