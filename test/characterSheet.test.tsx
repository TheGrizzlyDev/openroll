import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import CharacterSheet from '../src/morg_borg/CharacterSheet'
import {
  GameContext,
  type GameContextValue,
  type GameState,
  type GameAction
} from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

const renderWithWrapper = () => {
  const roll = vi.fn()
  function Wrapper() {
    const [state, setState] = React.useState<GameState>({
      characters: [],
      current: null,
      sheet: createSheet(),
      inventory: [],
      scrolls: [],
      log: [],
      activeTab: 'character',
      overlay: { message: '', visible: false }
    })

    const dispatch = vi.fn((action: GameAction) => {
      if (action.type === 'SET_SHEET') {
        setState(prev => ({ ...prev, sheet: action.sheet }))
      }
    })

    const providerValue: GameContextValue = {
      state,
      dispatch,
      overlayTimeout: { current: null },
      loadCharacter: vi.fn(),
      createCharacter: vi.fn(),
      finalizeCharacter: vi.fn(),
      cancelCreation: vi.fn(),
      deleteCharacter: vi.fn(),
      exportCharacters: () => '',
      importCharacters: () => false,
      roll,
      logInventory: vi.fn()
    }
    return (
      <GameContext.Provider value={providerValue}>
        <CharacterSheet />
      </GameContext.Provider>
    )
  }
  return { roll, ...render(<Wrapper />) }
}

afterEach(() => cleanup())

describe('CharacterSheet notes', () => {
  it('renders dice in notes and persists', () => {
    const { getByText, container, roll } = renderWithWrapper()
    fireEvent.click(getByText('Edit'))
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test [dice 1d4]' } })
    fireEvent.click(getByText('Save'))
    const diceBtn = getByText('1d4')
    fireEvent.click(diceBtn)
    expect(roll).toHaveBeenCalledWith('1d4')
  })
})
