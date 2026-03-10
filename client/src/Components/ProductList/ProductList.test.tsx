import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProductList } from './ProductList'

vi.mock('@/hooks', () => ({
  useProducts: vi.fn(),
}))

const mockedUseProducts = (await import('@/hooks')).useProducts as unknown as ReturnType<
  typeof vi.fn
>

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ProductList />
    </ThemeProvider>
  )
}

describe('ProductList', () => {
  it('renders loading state', () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    renderWithTheme()
    expect(screen.getByText(/Loading products/i)).toBeTruthy()
  })

  it('renders error state with retry', () => {
    const refetch = vi.fn()
    mockedUseProducts.mockReturnValue({
      products: [],
      isLoading: false,
      error: new Error('boom'),
      refetch,
    })

    renderWithTheme()
    expect(screen.getByText(/Failed to load products/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders empty state when no products', () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderWithTheme()
    expect(screen.getByText(/No products found/i)).toBeTruthy()
  })

  it('renders a list of products', () => {
    mockedUseProducts.mockReturnValue({
      products: [
        {
          id: 1,
          name: 'Test Product',
          description: 'A test product',
          price: 9.99,
          stockQuantity: 5,
          category: 'Demo',
          imageUrl: null,
          isActive: true,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderWithTheme()
    expect(screen.getByText('Test Product')).toBeTruthy()
    expect(screen.getByText('$9.99')).toBeTruthy()
    expect(screen.getByText(/5 in stock/)).toBeTruthy()
    expect(screen.getByText('A test product')).toBeTruthy()
  })
})

