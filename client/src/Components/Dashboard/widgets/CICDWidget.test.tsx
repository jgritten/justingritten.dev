import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CICDWidget } from './CICDWidget'

function CICDWidgetWithTheme() {
  return (
    <ThemeProvider>
      <CICDWidget />
    </ThemeProvider>
  )
}

describe('CICDWidget', () => {
  it('renders pipeline heading and subtitle', () => {
    render(<CICDWidgetWithTheme />)
    expect(
      screen.getByRole('heading', { name: 'How this site is built', level: 2 })
    ).toBeTruthy()
    expect(screen.getByText('From code to production')).toBeTruthy()
  })

  it('renders all four pipeline steps in order', () => {
    render(<CICDWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: 'Cursor', level: 3 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'GitHub', level: 3 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'GitHub Actions', level: 3 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'S3 + Squarespace', level: 3 })).toBeTruthy()
  })

  it('describes Cursor step with AI workflow', () => {
    render(<CICDWidgetWithTheme />)
    expect(
      screen.getByText(/Code is developed with Cursor using an AI agent/)
    ).toBeTruthy()
  })

  it('describes GitHub step', () => {
    render(<CICDWidgetWithTheme />)
    expect(screen.getByText(/Changes are committed and pushed to the repository/)).toBeTruthy()
  })

  it('describes hosting with S3 and Squarespace', () => {
    render(<CICDWidgetWithTheme />)
    expect(
      screen.getByText(/Squarespace handles domain and DNS/)
    ).toBeTruthy()
  })
})
