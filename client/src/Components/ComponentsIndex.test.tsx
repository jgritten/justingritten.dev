import { describe, it, expect } from 'vitest'
import { AppShell, Dashboard, FrontPage, ProductList } from '@/Components'

describe('Components index re-exports', () => {
  it('exposes core components', () => {
    expect(AppShell).toBeDefined()
    expect(Dashboard).toBeDefined()
    expect(FrontPage).toBeDefined()
    expect(ProductList).toBeDefined()
  })
})

