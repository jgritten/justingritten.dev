import type { ComponentProps } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CrudSlidePanel } from './CrudSlidePanel'

function CrudSlidePanelWithTheme(props: ComponentProps<typeof CrudSlidePanel>) {
  return (
    <ThemeProvider>
      <CrudSlidePanel {...props} />
    </ThemeProvider>
  )
}

describe('CrudSlidePanel', () => {
  it('renders main slot', () => {
    render(
      <CrudSlidePanelWithTheme
        open={false}
        onOpenChange={vi.fn()}
        isDirty={false}
        onSave={vi.fn()}
        main={<div>Main area</div>}
      >
        <div>Panel body</div>
      </CrudSlidePanelWithTheme>
    )
    expect(screen.getByText('Main area')).toBeTruthy()
  })

  it('opens discard flow when Cancel is used with dirty state', async () => {
    const onOpenChange = vi.fn()
    render(
      <CrudSlidePanelWithTheme
        open
        onOpenChange={onOpenChange}
        isDirty
        onSave={vi.fn()}
        title="Edit item"
        main={<div>List</div>}
      >
        <div>Form</div>
      </CrudSlidePanelWithTheme>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText(/Discard changes/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
