import { describe, it, expect, afterEach, vi } from 'vitest'
import { useGameContext } from '../src/stores/GameContext'
import { createSheet } from '../src/mork_borg/sheet'

const resetStore = () => {
  const initial = useGameContext.getInitialState()
  useGameContext.setState(
    {
      ...initial,
      state: { ...initial.state },
      overlayTimeout: null
    },
    true,
  )
}

afterEach(() => {
  vi.useRealTimers()
  resetStore()
})

describe('GameContext character sync', () => {
  it('syncs sheet changes and updates lastAccess for the current character', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    const sheet = createSheet()
    sheet.name = 'Before'
    const initial = useGameContext.getInitialState()
    useGameContext.setState({
      ...initial,
      state: {
        ...initial.state,
        current: 0,
        characters: [
          {
            id: 'char-1',
            name: 'Before',
            sheet,
            inventory: [],
            scrolls: [],
            counters: []
          }
        ],
        lastAccess: { 'char-1': 123 }
      }
    })

    useGameContext.getState().dispatch({
      type: 'SET_SHEET',
      sheet: { ...sheet, name: 'After' }
    })

    const { characters, lastAccess } = useGameContext.getState().state
    expect(characters[0]?.sheet.name).toBe('After')
    expect(lastAccess['char-1']).toBe(Date.now())
  })
})
