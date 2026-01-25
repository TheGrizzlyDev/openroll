import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CharacterSheet from '../src/mork_borg/CharacterSheet'
import { createSheet } from '../src/mork_borg/sheet'
import { useGameContext, type GameState } from '../src/stores/GameContext'

const resetStore = (state: Partial<GameState> = {}) => {
  const initial = useGameContext.getInitialState()
  useGameContext.setState(
    {
      ...initial,
      state: { ...initial.state, ...state },
      overlayTimeout: null
    },
    true,
  )
}

afterEach(() => {
  resetStore()
})

describe('CharacterSheet class selection', () => {
  it('updates the current class when a class is selected', async () => {
    const sheet = { ...createSheet(), name: 'Tester' }
    resetStore({ sheet, inventory: [] })

    render(<CharacterSheet />)

    fireEvent.click(screen.getByRole('button', { name: /gutterborn scum/i }))

    expect(screen.getByRole('heading', { name: /select class/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /close class selector/i }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /select class/i })).toBeNull()
    })

    fireEvent.click(screen.getByRole('button', { name: /gutterborn scum/i }))

    fireEvent.click(screen.getByRole('button', { name: /fanged deserter/i }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /select class/i })).toBeNull()
    })

    expect(useGameContext.getState().state.sheet.class).toBe('Fanged Deserter')
    expect(screen.getByRole('button', { name: /fanged deserter/i })).toBeTruthy()
  })
})
