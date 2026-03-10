import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SaasDashboard } from './SaasDashboard'

function SaasDashboardWithTheme() {
  return (
    <ThemeProvider>
      <SaasDashboard />
    </ThemeProvider>
  )
}

describe('SaasDashboard', () => {
  it('renders SaaS dashboard heading and description', () => {
    render(<SaasDashboardWithTheme />)
    expect(screen.getByRole('heading', { name: /SaaS Demo Dashboard/i, level: 1 })).toBeTruthy()
    expect(
      screen.getByText(/Home of the SaaS product demo\. This area will evolve/i)
    ).toBeTruthy()
  })

  it('marks the main section with accessible label', () => {
    render(<SaasDashboardWithTheme />)
    expect(screen.getByRole('region', { name: /SaaS dashboard/i })).toBeTruthy()
  })
})

