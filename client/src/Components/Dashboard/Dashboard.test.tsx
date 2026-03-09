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

  it('renders Welcome widget', () => {
    render(<DashboardWithTheme />)
    expect(screen.getByRole('heading', { name: 'Welcome', level: 1 })).toBeTruthy()
  })

  it('renders welcome content (name and tagline)', () => {
    render(<DashboardWithTheme />)
    expect(screen.getByRole('heading', { name: 'Justin Gritten', level: 2 })).toBeTruthy()
    expect(screen.getByText('.NET & React developer')).toBeTruthy()
  })

  it('includes GitHub source and profile links', () => {
    render(<DashboardWithTheme />)
    expect(screen.getByRole('link', { name: /view source on github/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /view profile on github/i })).toBeTruthy()
  })
})
