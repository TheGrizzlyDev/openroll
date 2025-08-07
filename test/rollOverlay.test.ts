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
    const { total, output } = roll('2d6+3')
    expect(total).toBe(5)
    expect(output).toBe('2d6+3: [1, 1]+3 = 5')

    const overlay = useGameContext.getState().state.overlay
    expect(overlay.message).toBe('2d6+3: [1, 1]+3 = 5')

    const logEntry = useGameContext.getState().state.log[0]
    expect(logEntry.output).toBe('2d6+3: [1, 1]+3 = 5')
  })
})
