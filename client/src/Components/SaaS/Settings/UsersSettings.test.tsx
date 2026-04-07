import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SaasClientProvider } from '@/contexts/SaasClientContext'
import { UsersSettings } from './UsersSettings'

function UsersSettingsWithProviders() {
  return (
    <ThemeProvider>
      <SaasClientProvider>
        <UsersSettings />
      </SaasClientProvider>
    </ThemeProvider>
  )
}

describe('UsersSettings', () => {
  it('renders Users & roles heading and Users tab table', () => {
    render(<UsersSettingsWithProviders />)
    expect(screen.getByRole('heading', { name: /Users & roles/i, level: 2 })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /send invitation/i })).toBeNull()
  })

  it('shows Roles table when initial tab is roles', () => {
    render(
      <ThemeProvider>
        <SaasClientProvider>
          <UsersSettings initialTab="roles" />
        </SaasClientProvider>
      </ThemeProvider>
    )
    expect(screen.getByRole('columnheader', { name: 'Type' })).toBeTruthy()
  })
})
