import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { FrontPage } from './FrontPage'

function FrontPageWithTheme() {
  return (
    <ThemeProvider>
      <FrontPage />
    </ThemeProvider>
  )
}

describe('FrontPage', () => {
  it('renders main hero content', () => {
    render(<FrontPageWithTheme />)
    expect(screen.getByRole('heading', { name: /Justin Gritten/i, level: 1 })).toBeTruthy()
    expect(screen.getByText(/\.NET & React developer/i)).toBeTruthy()
    expect(screen.getByText(/Building full-stack applications/i)).toBeTruthy()
  })

  it('includes link to GitHub source', () => {
    render(<FrontPageWithTheme />)
    const link = screen.getByRole('link', { name: /View source on GitHub/i })
    expect(link.getAttribute('href')).toBe('https://github.com/jgritten/justingritten.dev')
  })
})

