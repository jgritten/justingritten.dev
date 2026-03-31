import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Footer } from './Footer'

vi.mock('@/api', () => ({
  metricsApi: {
    recordVisit: vi.fn().mockResolvedValue({ message: 'ok' }),
  },
}))

const { metricsApi } = await import('@/api')

function FooterWithTheme() {
  return (
    <ThemeProvider>
      <Footer />
    </ThemeProvider>
  )
}

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('records metric when Resume is clicked', () => {
    render(<FooterWithTheme />)
    fireEvent.click(screen.getByRole('link', { name: /resume/i }))
    expect(metricsApi.recordVisit).toHaveBeenCalledWith('/outbound/resume')
  })

  it('records metric when LinkedIn is clicked', () => {
    render(<FooterWithTheme />)
    fireEvent.click(screen.getByRole('link', { name: /linkedin/i }))
    expect(metricsApi.recordVisit).toHaveBeenCalledWith('/outbound/linkedin')
  })

  it('records metric when Email is clicked', () => {
    render(<FooterWithTheme />)
    fireEvent.click(screen.getByRole('link', { name: /email/i }))
    expect(metricsApi.recordVisit).toHaveBeenCalledWith('/outbound/email')
  })
})
