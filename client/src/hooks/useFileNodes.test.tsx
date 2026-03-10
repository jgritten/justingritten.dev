import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useFileNodes } from './useFileNodes'
import { mockAPI } from '@/lib/mockAPI'

vi.mock('@/lib/mockAPI', async (orig) => {
  const actual = (await orig()) as typeof import('@/lib/mockAPI')
  return {
    ...actual,
    mockAPI: {
      ...actual.mockAPI,
      getFileNodes: vi.fn(actual.mockAPI.getFileNodes),
    },
  }
})

function TestComponent() {
  const { nodes, isLoading, error, refresh } = useFileNodes()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error ? error.message : ''}</div>
      <div data-testid="count">{nodes.length}</div>
      <button type="button" onClick={refresh}>
        Refresh
      </button>
    </div>
  )
}

describe('useFileNodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads file nodes after delay and supports refresh', async () => {
    render(<TestComponent />)

    expect(screen.getByTestId('loading').textContent).toBe('loading')

    await waitFor(
      () => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
      },
      { timeout: 2000 }
    )

    expect(mockAPI.getFileNodes).toHaveBeenCalledTimes(1)
    const firstCount = Number(screen.getByTestId('count').textContent)
    expect(firstCount).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }))

    await waitFor(
      () => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
      },
      { timeout: 2000 }
    )

    expect(mockAPI.getFileNodes).toHaveBeenCalledTimes(2)
  })
})

