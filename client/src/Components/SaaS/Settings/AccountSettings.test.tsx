import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AccountSettings } from './AccountSettings'

function AccountSettingsWithTheme() {
  return (
    <ThemeProvider>
      <AccountSettings />
    </ThemeProvider>
  )
}

describe('AccountSettings', () => {
  it('renders Account heading and descriptive text', () => {
    render(<AccountSettingsWithTheme />)
    expect(screen.getByRole('heading', { name: /Account/i, level: 2 })).toBeTruthy()
    expect(screen.getByText(/Your account, profile, sign-in, and contact info/i)).toBeTruthy()
  })
})
