import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ClientSettings } from './ClientSettings'

function ClientSettingsWithTheme() {
  return (
    <ThemeProvider>
      <ClientSettings />
    </ThemeProvider>
  )
}

describe('ClientSettings', () => {
  it('renders Client heading and descriptive text', () => {
    render(<ClientSettingsWithTheme />)
    expect(screen.getByRole('heading', { name: /Client/i, level: 2 })).toBeTruthy()
    expect(screen.getByText(/Client access, affiliations, and user management/i)).toBeTruthy()
  })
})

