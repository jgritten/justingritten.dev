import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import App from './App'

function AppWithProviders() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

describe('App', () => {
  it('renders shell and dashboard at /', () => {
    window.history.pushState({}, '', '/')
    render(<AppWithProviders />)
    expect(screen.getByRole('heading', { name: /justin gritten/i })).toBeTruthy()
    expect(screen.getByText(/\.NET & React developer/)).toBeTruthy()
  })

  it('renders Profile link in sidebar', () => {
    window.history.pushState({}, '', '/')
    render(<AppWithProviders />)
    const mainNav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(within(mainNav).getByRole('link', { name: /profile/i })).toBeTruthy()
  })
})
