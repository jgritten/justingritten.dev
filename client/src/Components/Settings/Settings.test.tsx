import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Settings } from './Settings'

describe('Settings', () => {
  it('renders nested routed content via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings" element={<Settings />}>
            <Route index element={<div>Settings index content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Settings index content')).toBeTruthy()
  })
})

