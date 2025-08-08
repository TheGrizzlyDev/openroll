import { describe, it, expect, afterEach } from 'vitest'
import { NumberGenerator } from '@dice-roller/rpg-dice-roller'
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
  NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  resetStore()
})

describe('GameContext roll breakdown', () => {
  it('records full breakdown in overlay and log', () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    resetStore()
    const { roll } = useGameContext.getState()
    const { total, output } = roll('1d4+3d20')
    expect(total).toBe(4)
    expect(output).toBe('1d4+3d20: [1]+[1, 1, 1] = 4')

    const overlay = useGameContext.getState().state.overlay
    expect(overlay.message).toBe('1d4+3d20: [1]+[1, 1, 1] = 4')
    expect(overlay.roll).toEqual({
      dice: [
        { type: 'd4', result: 1 },
        { type: 'd20', result: 1 },
        { type: 'd20', result: 1 },
        { type: 'd20', result: 1 }
      ],
      total: 4
    })
    expect(overlay.visible).toBe(true)

    const logEntry = useGameContext.getState().state.log[0]
    expect(logEntry.output).toBe('1d4+3d20: [1]+[1, 1, 1] = 4')
  })
})
