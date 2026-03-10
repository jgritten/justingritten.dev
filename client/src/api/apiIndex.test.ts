import { describe, it, expect } from 'vitest'
import { getApiUrl, apiGet, productsApi } from '@/api'

describe('api index re-exports', () => {
  it('exposes api helpers and productsApi', () => {
    expect(typeof getApiUrl).toBe('function')
    expect(typeof apiGet).toBe('function')
    expect(productsApi).toBeDefined()
  })
})

