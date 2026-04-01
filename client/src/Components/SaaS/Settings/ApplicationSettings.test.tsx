import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ApplicationSettings } from './ApplicationSettings'

function ApplicationSettingsWithTheme() {
  return (
    <ThemeProvider>
      <ApplicationSettings />
    </ThemeProvider>
  )
}

describe('ApplicationSettings', () => {
  it('renders Application heading and descriptive text', () => {
    render(<ApplicationSettingsWithTheme />)
    expect(screen.getByRole('heading', { name: /Application/i, level: 2 })).toBeTruthy()
    expect(screen.getByText(/Theme, display, and app preferences/i)).toBeTruthy()
  })
})
