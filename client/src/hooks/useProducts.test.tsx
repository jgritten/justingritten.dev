import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useProducts } from './useProducts'

vi.mock('@/api', () => ({
  productsApi: {
    getAll: vi.fn(),
    getActive: vi.fn(),
  },
}))

const { productsApi } = await import('@/api')

function TestComponent({ activeOnly = false }: { activeOnly?: boolean }) {
  const { products, isLoading, error, refetch } = useProducts(activeOnly)

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error ? error.message : ''}</div>
      <div data-testid="count">{products.length}</div>
      <button type="button" onClick={refetch}>
        Refetch
      </button>
    </div>
  )
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches all products by default', async () => {
    ;(productsApi.getAll as any).mockResolvedValue([{ id: 1 }])

    render(<TestComponent />)

    expect(screen.getByTestId('loading').textContent).toBe('loading')

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })

    expect(productsApi.getAll).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('fetches active products when activeOnly is true', async () => {
    ;(productsApi.getActive as any).mockResolvedValue([{ id: 1 }, { id: 2 }])

    render(<TestComponent activeOnly />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })

    expect(productsApi.getActive).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('2')
  })

  it('handles errors and allows refetch', async () => {
    const error = new Error('Oops')
    ;(productsApi.getAll as any).mockRejectedValueOnce(error).mockResolvedValueOnce([])

    render(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('loaded')
    })

    expect(screen.getByTestId('error').textContent).toBe('Oops')

    fireEvent.click(screen.getByRole('button', { name: /Refetch/i }))

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('')
    })
  })
})

