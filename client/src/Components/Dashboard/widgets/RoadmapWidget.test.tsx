import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { RoadmapWidget } from './RoadmapWidget'

function RoadmapWidgetWithTheme() {
  return (
    <ThemeProvider>
      <RoadmapWidget />
    </ThemeProvider>
  )
}

describe('RoadmapWidget', () => {
  it('renders Roadmap heading and mission statement', () => {
    render(<RoadmapWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: 'Roadmap', level: 2 })).toBeTruthy()
    expect(
      screen.getByText(/A portfolio site showcasing SaaS functionality in a simulated commercial environment/)
    ).toBeTruthy()
    expect(screen.getByText('Implementation phases')).toBeTruthy()
  })

  it('renders all six phases in order', () => {
    render(<RoadmapWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: /Phase 0: Foundation/, level: 3 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Phase 1: SaaS - Authentication/, level: 3 })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /Phase 2: SaaS - Tenancy \(clients\)/, level: 3 })
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /Phase 3: SaaS - Realtime and notifications/, level: 3 })
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /Phase 4: SaaS - Polish and extra features/, level: 3 })
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /Phase 5: SaaS - Later \/ learning-focused/, level: 3 })
    ).toBeTruthy()
  })

  it('marks Phase 0 as completed with Done badge', () => {
    render(<RoadmapWidgetWithTheme />)
    expect(screen.getByRole('heading', { name: /Phase 0: Foundation/ })).toBeTruthy()
    expect(screen.getByLabelText('Completed')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
  })

  it('renders sublist items for Phase 0', () => {
    render(<RoadmapWidgetWithTheme />)
    expect(screen.getByText(/Guest as default entry/)).toBeTruthy()
    expect(screen.getByText(/App shell and layout/)).toBeTruthy()
    expect(screen.getByText(/Theme persistence/)).toBeTruthy()
  })

  it('renders sublist items for a later phase', () => {
    render(<RoadmapWidgetWithTheme />)
    expect(screen.getByText(/Username\/password login/)).toBeTruthy()
    expect(screen.getByText(/WebSocket/)).toBeTruthy()
  })
})
