import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Notes from '../src/components/Notes'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    value,
    onChange
  }: {
    value: string
    onChange: (_value: string) => void
  }) => <textarea value={value} onChange={e => onChange(e.target.value)} />
}))

const resetStore = () => {
  const initial: GameState = {
    characters: [],
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', visible: false }
  }
  useGameContext.setState({ state: initial, overlayTimeout: null })
}

afterEach(() => {
  cleanup()
  resetStore()
})

describe('Notes tab', () => {
  it('renders correctly', () => {
    resetStore()
    const { container } = render(<Notes />)
    expect(container).toMatchSnapshot()
  })

  it('renders dice in notes and persists', () => {
    resetStore()
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { getByText, container } = render(<Notes />)
    fireEvent.click(getByText('Edit'))
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test [dice "1d4" 1d4]' } })
    fireEvent.click(getByText('Save'))
    const diceBtn = getByText('1d4')
    fireEvent.click(diceBtn)
    expect(roll).toHaveBeenCalledWith('1d4')
  })
})

