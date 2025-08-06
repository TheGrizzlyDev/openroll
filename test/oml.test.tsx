import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { parseOml, renderOml, renderNodes, type OmlNode } from '../src/oml/render'
import { useGameContext } from '../src/GameContext'

describe('oml parsing', () => {
  it('tokenizes text and dice tags with descriptions and attrs', () => {
    const nodes = parseOml('Deal [dice 2d6+3 "fire" kind=burn] damage')
    expect(nodes).toEqual([
      { type: 'text', text: 'Deal ' },
      { type: 'dice', notation: '2d6+3', description: 'fire', attrs: { kind: 'burn' } },
      { type: 'text', text: ' damage' }
    ])
  })

  it('parses if blocks terminated by fi', () => {
    const nodes = parseOml('[if]hit[else]miss[fi]')
    expect(nodes).toMatchObject([
      {
        type: 'if',
        branches: [
          { type: 'if', children: [{ type: 'text', text: 'hit' }] },
          { type: 'else', children: [{ type: 'text', text: 'miss' }] }
        ]
      }
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

  it('replaces button label with description when provided', () => {
    const roll = vi.fn()
    const nodes: OmlNode[] = [
      { type: 'dice', notation: '1d4', description: 'a d4', attrs: {} }
    ]
    const { getByText } = render(<div>{renderNodes(nodes, roll)}</div>)
    const badge = getByText('a d4')
    fireEvent.click(badge)
    expect(roll).toHaveBeenCalledWith('1d4')
  })

  it('replaces link label with description when provided', () => {
    const nodes: OmlNode[] = [
      {
        type: 'link',
        url: 'https://example.com',
        text: 'Example',
        description: 'An example link'
      }
    ]
    const { getByText } = render(<div>{renderNodes(nodes, vi.fn())}</div>)
    const link = getByText('An example link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('https://example.com')
  })
})
