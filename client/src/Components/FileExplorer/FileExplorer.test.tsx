import { describe, it, expect, vi, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileExplorer from './FileExplorer'
import type { fileNodesResult } from '@/hooks/useFileNodes'

vi.mock('@/hooks/useFileNodes', () => ({
  useFileNodes: vi.fn(),
}))

const { useFileNodes } = await import('@/hooks/useFileNodes')

describe('FileExplorer', () => {
  it('renders loading state', () => {
    ;(useFileNodes as unknown as Mock).mockReturnValue({
      nodes: [],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    } satisfies fileNodesResult)

    render(<FileExplorer />)
    expect(screen.getByText(/Is Loading/i)).toBeTruthy()
  })

  it('renders error state', () => {
    ;(useFileNodes as unknown as Mock).mockReturnValue({
      nodes: [],
      isLoading: false,
      error: new Error('fail'),
      refresh: vi.fn(),
    } satisfies fileNodesResult)

    render(<FileExplorer />)
    expect(screen.getByText(/Error Occurred/i)).toBeTruthy()
  })

  it('renders nodes and allows refresh', () => {
    const refresh = vi.fn()
    ;(useFileNodes as unknown as Mock).mockReturnValue({
      nodes: [
        {
          name: 'root',
          type: 'directory',
          children: [{ name: 'file.txt', type: 'file' }],
        },
      ],
      isLoading: false,
      error: null,
      refresh,
    } satisfies fileNodesResult)

    render(<FileExplorer />)

    expect(screen.getByText(/File Explorer/)).toBeTruthy()
    expect(screen.getByText('root')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }))
    expect(refresh).toHaveBeenCalled()
  })
})

