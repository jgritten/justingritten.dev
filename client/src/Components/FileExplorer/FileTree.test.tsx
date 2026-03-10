import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'
import { FileTree } from './FileTree'
import type { FileNode } from '@/types/fileNode'

const nodes: FileNode[] = [
  {
    name: 'folder',
    type: 'directory',
    children: [
      {
        name: 'file.txt',
        type: 'file',
      },
    ],
  },
]

function Wrapper() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const handleToggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  return <FileTree nodes={nodes} parentPath="" expanded={expanded} onToggle={handleToggle} />
}

describe('FileTree', () => {
  it('renders tree and toggles folder expansion', () => {
    render(<Wrapper />)

    expect(screen.getByText('folder')).toBeTruthy()
    // initially collapsed, file is not visible
    expect(screen.queryByText('file.txt')).toBeNull()

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('file.txt')).toBeTruthy()

    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText('file.txt')).toBeNull()
  })
})

