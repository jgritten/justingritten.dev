import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Dashboard } from './Dashboard'

function DashboardWithTheme() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}

describe('Dashboard', () => {
  it('renders dashboard container with content-card class', () => {
    const { container } = render(<DashboardWithTheme />)
    const dashboard = container.querySelector('.dashboard')
    expect(dashboard).toBeTruthy()
    expect(container.querySelectorAll('.content-card').length).toBeGreaterThan(0)
  })

  it('renders key widget headings', () => {
    render(<DashboardWithTheme />)
    expect(
      screen.getByRole('heading', { name: /how this site is built/i })
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: /roadmap/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /recent activity/i })).toBeTruthy()
  })
})
