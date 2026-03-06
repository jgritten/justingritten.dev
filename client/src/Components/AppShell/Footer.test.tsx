import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Footer } from './Footer'

function FooterWithTheme() {
  return (
    <ThemeProvider>
      <Footer />
    </ThemeProvider>
  )
}

describe('Footer', () => {
  it('renders footer with contentinfo role', () => {
    render(<FooterWithTheme />)
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('has Resume link to resume PDF', () => {
    render(<FooterWithTheme />)
    const resume = screen.getByRole('link', { name: /resume/i })
    expect(resume.getAttribute('href')).toBe('/JustinGrittenResume.pdf')
    expect(resume.getAttribute('target')).toBe('_blank')
  })

  it('has LinkedIn link', () => {
    render(<FooterWithTheme />)
    const linkedIn = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedIn.getAttribute('href')).toBe('https://linkedin.com/in/justingritten')
    expect(linkedIn.getAttribute('target')).toBe('_blank')
  })

  it('has Email link', () => {
    render(<FooterWithTheme />)
    const email = screen.getByRole('link', { name: /email/i })
    expect(email.getAttribute('href')).toBe('mailto:justin.gritten@gmail.com')
  })
})
