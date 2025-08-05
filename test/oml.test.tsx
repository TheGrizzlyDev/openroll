import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { parseOml, renderOml } from '../src/oml/render'
import { useGameContext } from '../src/GameContext'

describe('oml parsing', () => {
  it('tokenizes text and dice tags', () => {
    const nodes = parseOml('Deal [dice 2d6+3] damage')
    expect(nodes).toEqual([
      { type: 'text', text: 'Deal ' },
      { type: 'dice', notation: '2d6+3' },
      { type: 'text', text: ' damage' }
    ])
  })
})

describe('oml rendering', () => {
  it('renders spans and clickable dice badges', () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const Test = () => <div>{renderOml('Roll [dice 1d4] now')}</div>
    const { getByText, container } = render(<Test />)
    const badge = getByText('1d4')
    fireEvent.click(badge)
    expect(roll).toHaveBeenCalledWith('1d4')
    expect(container.textContent).toBe('Roll 1d4 now')
  })
})
