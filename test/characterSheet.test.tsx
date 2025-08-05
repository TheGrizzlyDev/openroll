import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import CharacterSheet from '../src/morg_borg/CharacterSheet'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

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

describe('CharacterSheet notes', () => {
  it('renders dice in notes and persists', () => {
    resetStore()
    const roll = vi.fn()
    useGameContext.setState({ roll })
    const { getByText, container } = render(<CharacterSheet />)
    fireEvent.click(getByText('Edit'))
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test [dice 1d4]' } })
    fireEvent.click(getByText('Save'))
    const diceBtn = getByText('1d4')
    fireEvent.click(diceBtn)
    expect(roll).toHaveBeenCalledWith('1d4')
  })
})

