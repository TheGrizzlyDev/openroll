import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import CharacterSheet from '../src/mork_borg/CharacterSheet'
import { createSheet } from '../src/mork_borg/sheet'
import { useGameContext, type GameState } from '../src/stores/GameContext'

const resetStore = (state: Partial<GameState> = {}) => {
  const initial = useGameContext.getInitialState()
  useGameContext.setState(
    {
      ...initial,
      state: { ...initial.state, ...state }
    },
    true,
  )
}

afterEach(() => {
  resetStore()
})

describe('CharacterSheet roll log', () => {
  it('opens the roll log modal and lists roll entries', () => {
    const sheet = createSheet()
    resetStore({
      sheet,
      log: [
        { label: 'STR', notation: '1d20+2', output: '1d20+2: [15]+2', total: 17 },
        { label: 'OMENS', notation: '1d2', output: '1d2: [1]', total: 1 }
      ]
    })

    render(<CharacterSheet />)

    fireEvent.click(screen.getByRole('button', { name: /roll log/i }))

    expect(screen.getByRole('heading', { name: /roll log/i })).toBeTruthy()
    expect(screen.getByText('1d20+2')).toBeTruthy()
    expect(screen.getByText('1d20+2: [15]+2')).toBeTruthy()
    expect(screen.getByText('Total: 17')).toBeTruthy()
  })
})
