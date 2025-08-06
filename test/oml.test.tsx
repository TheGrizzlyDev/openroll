import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { parseOml, renderOml, renderNodes, type OmlNode } from '../src/oml/render'
import { useGameContext } from '../src/GameContext'

describe('oml parsing', () => {
  it('tokenizes text and dice tags with descriptions and attrs', () => {
    const nodes = parseOml('Deal [dice "fire" 2d6+3 kind=burn] damage')
    expect(nodes).toEqual([
      { type: 'text', text: 'Deal ' },
      { type: 'dice', notation: '2d6+3', description: 'fire', attrs: { kind: 'burn' } },
      { type: 'text', text: ' damage' }
    ])
  })

  it('parses apply tags with target and attrs', () => {
    const nodes = parseOml('[apply "fall" hp -1d6 reason=trip]')
    expect(nodes).toMatchObject([
      {
        type: 'apply',
        description: 'fall',
        target: 'hp',
        value: '-1d6',
        attrs: { reason: 'trip' }
      }
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

  it('captures predicates for conditional branches', () => {
    const nodes = parseOml('[if hp>0]up[elif hp==0]even[else]down[fi]')
    expect(nodes).toMatchObject([
      {
        type: 'if',
        branches: [
          { type: 'if', predicate: 'hp>0' },
          { type: 'elif', predicate: 'hp==0' },
          { type: 'else' }
        ]
      }
    ])
  })
})

describe('oml rendering', () => {
  it('renders spans and clickable dice badges', () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const Test = () => <div>{renderOml('Roll [dice "1d4" 1d4] now')}</div>
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
    const { getByText } = render(
      <div>{renderNodes(nodes, { roll, applyEffect: vi.fn() })}</div>
    )
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
    const { getByText } = render(
      <div>{renderNodes(nodes, { roll: vi.fn(), applyEffect: vi.fn() })}</div>
    )
    const link = getByText('An example link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('https://example.com')
  })

  it('renders active branch and fades inactive branch', () => {
    const current = useGameContext.getState().state
    useGameContext.setState({
      state: { ...current, sheet: { ...current.sheet, hp: 5 } }
    })
    const Test = () => <div>{renderOml('[if hp>0]Alive[else]Dead[fi]')}</div>
    const { container } = render(<Test />)
    const styled = Array.from(container.querySelectorAll('span[style]'))
    expect(styled).toHaveLength(1)
    expect(styled[0].textContent).toBe('Dead')
  })

  it('renders else branch when predicate is false', () => {
    const current = useGameContext.getState().state
    useGameContext.setState({
      state: { ...current, sheet: { ...current.sheet, hp: 0 } }
    })
    const Test = () => <div>{renderOml('[if hp>0]Alive[else]Dead[fi]')}</div>
    const { container } = render(<Test />)
    const styled = Array.from(container.querySelectorAll('span[style]'))
    expect(styled).toHaveLength(1)
    expect(styled[0].textContent).toBe('Alive')
  })

  it('handles nested conditionals', () => {
    const current = useGameContext.getState().state
    useGameContext.setState({
      state: { ...current, sheet: { ...current.sheet, hp: 5, omens: 0 } }
    })
    const text =
      '[if hp>0]live[if omens>0] omen [else] none [fi][else]dead[fi]'
    const Test = () => <div>{renderOml(text)}</div>
    const { container } = render(<Test />)
    const styledTexts = Array.from(
      container.querySelectorAll('span[style]')
    ).map(s => s.textContent?.trim())
    expect(styledTexts).toContain('omen')
    expect(styledTexts).toContain('dead')
    expect(styledTexts).not.toContain('live')
    expect(styledTexts).not.toContain('none')
  })
})
