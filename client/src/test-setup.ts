import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom does not implement matchMedia; ThemeContext's useIsDarkTheme uses it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
})

afterEach(() => {
  cleanup()
})
