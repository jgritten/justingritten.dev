import { useState, useEffect, useCallback } from 'react'
import { productsApi } from '@/api'
import type { Product } from '@/types'

interface UseProductsResult {
  products: Product[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/** Fetch products from the .NET API. */
export function useProducts(activeOnly = false): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(() => {
    setIsLoading(true)
    setError(null)
    const fetchFn = activeOnly ? productsApi.getActive() : productsApi.getAll()
    fetchFn
      .then(setProducts)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [activeOnly])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, isLoading, error, refetch: fetchProducts }
}
