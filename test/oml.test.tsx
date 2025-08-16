import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { RenderOml, RenderNodes } from '../src/oml/render'
import { parseOml, type OmlNode } from '../src/oml/parser'
import { useGameContext } from '../src/stores/GameContext'

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

  it('parses link tags with url, text, and description', () => {
    const nodes = parseOml('See [link "Example site" https://example.com Example] now')
    expect(nodes).toEqual([
      { type: 'text', text: 'See ' },
      {
        type: 'link',
        url: 'https://example.com',
        text: 'Example',
        description: 'Example site'
      },
      { type: 'text', text: ' now' }
    ])
  })

  it('parses name tags', () => {
    const nodes = parseOml('Hello [name]')
    expect(nodes).toEqual([
      { type: 'text', text: 'Hello ' },
      { type: 'name' }
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
  afterEach(() => cleanup())
  it('renders correctly', () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const Test = () => <div>{RenderOml('Roll [dice "1d4" 1d4] now')}</div>
    render(<Test />)
  })

  it('renders spans and clickable dice badges', () => {
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const Test = () => <div>{RenderOml('Roll [dice "1d4" 1d4] now')}</div>
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
      <div>{RenderNodes(nodes, { roll, applyEffect: vi.fn() })}</div>
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
      <div>{RenderNodes(nodes, { roll: vi.fn(), applyEffect: vi.fn() })}</div>
    )
    const link = getByText('An example link') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('https://example.com')
  })

  it('renders character name for name tags', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, sheet: { ...initial.sheet, name: 'Azure' } }
    })
    const Test = () => <div>{RenderOml('I am [name]')}</div>
    const { container } = render(<Test />)
    expect(container.textContent).toBe('I am Azure')
  })

  it('renders active branch and fades inactive branch', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, sheet: { ...initial.sheet, hp: 5 } }
    })
    const Test = () => <div>{RenderOml('[if hp>0]Alive[else]Dead[fi]')}</div>
    const { container } = render(<Test />)
    const styled = Array.from(container.querySelectorAll('span[style*="opacity"]'))
    expect(styled).toHaveLength(1)
    expect(styled[0].textContent).toBe('Dead')
  })

  it('renders else branch when predicate is false', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, sheet: { ...initial.sheet, hp: 0 } }
    })
    const Test = () => <div>{RenderOml('[if hp>0]Alive[else]Dead[fi]')}</div>
    const { container } = render(<Test />)
    const styled = Array.from(container.querySelectorAll('span[style*="opacity"]'))
    expect(styled).toHaveLength(1)
    expect(styled[0].textContent).toBe('Alive')
  })

  it('handles nested conditionals', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, sheet: { ...initial.sheet, hp: 5, omens: 0 } }
    })
    const text =
      '[if hp>0]live[if omens>0] omen [else] none [fi][else]dead[fi]'
    const Test = () => <div>{RenderOml(text)}</div>
    const { container } = render(<Test />)
    const styledTexts = Array.from(
      container.querySelectorAll('span[style*="opacity"]')
    ).map(s => s.textContent?.trim())
    expect(styledTexts).toContain('omen')
    expect(styledTexts).toContain('dead')
    expect(styledTexts).not.toContain('live')
    expect(styledTexts).not.toContain('none')
  })

  it('preserves newline characters within text but trims those at the edges', () => {
    const Test = () => <div>{RenderOml('\nline1\nline2\n')}</div>
    const { container } = render(<Test />)
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })

  it('trims edge whitespace while preserving internal spaces', () => {
    const Test = () => <div>{RenderOml('  foo   bar  ')}</div>
    const { container } = render(<Test />)
    expect(container.textContent).toBe('foo   bar')
    const span = container.querySelector('span') as HTMLSpanElement | null
    expect(span?.style.whiteSpace).toBe('break-spaces')
  })
})
