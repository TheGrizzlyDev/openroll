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

describe('CharacterSheet counter tracker', () => {
  it('decrements all counters and keeps turns editable', () => {
    const sheet = createSheet()
    const counters = [
      { id: 1, name: 'Torch', turns: 3, notes: 'Flickers.' }
    ]
    resetStore({ sheet, counters })

    render(<CharacterSheet />)

    const turnsInput = screen.getByRole('spinbutton', { name: 'Torch turns' })
    expect((turnsInput as HTMLInputElement).value).toBe('3')

    const decrementButton = screen.getByRole('button', { name: /decrement all/i })
    fireEvent.click(decrementButton)

    expect((turnsInput as HTMLInputElement).value).toBe('2')

    fireEvent.change(turnsInput, { target: { value: '5' } })
    expect((turnsInput as HTMLInputElement).value).toBe('5')
  })
})
