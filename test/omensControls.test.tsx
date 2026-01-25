import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

describe('CharacterSheet omens controls', () => {
  it('updates the omens count from the controls', () => {
    const sheet = { ...createSheet(), omens: 1 }
    resetStore({ sheet })

    render(<CharacterSheet />)

    fireEvent.click(screen.getByRole('button', { name: /increase omens/i }))
    expect(useGameContext.getState().state.sheet.omens).toBe(2)

    fireEvent.click(screen.getByRole('button', { name: /decrease omens/i }))
    expect(useGameContext.getState().state.sheet.omens).toBe(1)

  })

  it('uses the configured omens die when rolling', () => {
    const sheet = { ...createSheet(), omens: 0 }
    resetStore({ sheet })

    render(<CharacterSheet />)

    const dieInput = screen.getByLabelText(/omens die/i)
    fireEvent.change(dieInput, { target: { value: '1d1' } })
    fireEvent.blur(dieInput)

    const rollButtons = screen.getAllByRole('button', { name: /roll 1d1 omens/i })
    fireEvent.click(rollButtons[0])
    expect(useGameContext.getState().state.sheet.omens).toBe(1)
  })
})
