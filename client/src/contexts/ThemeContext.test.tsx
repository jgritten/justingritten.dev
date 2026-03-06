import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

const STORAGE_KEY = 'justingritten-theme'

function Consumer() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="appearance">{theme.appearance}</span>
      <span data-testid="accent">{theme.accentColor}</span>
      <button
        type="button"
        onClick={() => setTheme({ appearance: 'dark' })}
      >
        Set dark
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it('provides default theme when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('appearance').textContent).toBe('inherit')
    expect(screen.getByTestId('accent').textContent).toBe('indigo')
  })

  it('persists theme to localStorage when setTheme is called', () => {
    const { container } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    const button = container.querySelector('button')
    expect(button?.textContent).toBe('Set dark')
    act(() => {
      button!.click()
    })

    const appearance = container.querySelector('[data-testid="appearance"]')
    expect(appearance?.textContent).toBe('dark')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.appearance).toBe('dark')
  })

  it('loads theme from localStorage on mount', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ appearance: 'light', accentColor: 'blue' })
    )
    const { container } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    const appearance = container.querySelector('[data-testid="appearance"]')
    const accent = container.querySelector('[data-testid="accent"]')
    expect(appearance?.textContent).toBe('light')
    expect(accent?.textContent).toBe('blue')
  })
})
