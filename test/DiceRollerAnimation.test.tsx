import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { NumberGenerator } from '@dice-roller/rpg-dice-roller'
import DiceRoller from '../src/DiceRoller'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

const resetStore = (state: Partial<GameState> = {}) => {
  const base: GameState = {
    characters: [],
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', roll: null, visible: false },
    diceStyle: { color: '#ffffff', edgeColor: '#000000', textureUrls: [] }
  }
  useGameContext.setState({ state: { ...base, ...state }, overlayTimeout: null })
}

afterEach(() => {
  cleanup()
  NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  resetStore()
})

describe('DiceRoller', () => {
  it('triggers overlay with correct roll result', () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    resetStore()
    const { getByText, getByPlaceholderText } = render(<DiceRoller />)
    fireEvent.change(getByPlaceholderText('1d20'), { target: { value: '1d4+3d20' } })
    fireEvent.click(getByText('Roll'))
    const overlay = useGameContext.getState().state.overlay
    expect(overlay.visible).toBe(true)
    expect(overlay.roll).toEqual({
      dice: [
        { type: 'd4', result: 1 },
        { type: 'd20', result: 1 },
        { type: 'd20', result: 1 },
        { type: 'd20', result: 1 }
      ],
      total: 4
    })
  })
})
