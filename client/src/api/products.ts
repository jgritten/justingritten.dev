import { apiGet } from './client'
import type { Product } from '@/types'

const BASE = '/api/products'

export const productsApi = {
  /** Fetch all products */
  getAll: () => apiGet<Product[]>(BASE),

  /** Fetch active products only */
  getActive: () => apiGet<Product[]>(`${BASE}/active`),
}
