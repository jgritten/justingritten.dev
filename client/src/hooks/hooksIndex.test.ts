import { describe, it, expect } from 'vitest'
import { useProducts, useRecentCommits } from '@/hooks'

describe('hooks index re-exports', () => {
  it('exposes useProducts and useRecentCommits', () => {
    expect(typeof useProducts).toBe('function')
    expect(typeof useRecentCommits).toBe('function')
  })
})

