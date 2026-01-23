import { describe, it, expect, afterEach } from 'vitest'
import { NumberGenerator } from '@dice-roller/rpg-dice-roller'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SheetPage from '../src/components/SheetPage'
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
  NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  resetStore()
})

describe('SheetPage overlay', () => {
  it('shows and clears the roll overlay', async () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    const sheet = { ...createSheet(), name: 'Tester' }
    const characters = [
      {
        id: 'tester',
        name: 'Tester',
        sheet,
        inventory: [],
        scrolls: []
      }
    ]
    resetStore({ characters, sheet })

    render(
      <MemoryRouter initialEntries={['/sheet/0']}>
        <Routes>
          <Route path="/sheet/:id" element={<SheetPage />} />
        </Routes>
      </MemoryRouter>
    )

    act(() => {
      useGameContext.getState().roll('1d4')
    })

    expect(await screen.findByRole('heading', { name: 'ROLL RESULT' })).toBeTruthy()
    const okButton = screen.getByRole('button', { name: 'OK' })
    fireEvent.click(okButton)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'ROLL RESULT' })).toBeNull()
    })
  })
})
