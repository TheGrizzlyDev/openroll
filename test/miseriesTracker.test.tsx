import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CharacterSheet from '../src/mork_borg/CharacterSheet'
import { createSheet } from '../src/mork_borg/sheet'
import { miseries } from '../src/mork_borg/data/traits'
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
  cleanup()
})

describe('CharacterSheet miseries tracker', () => {
  it('adds a misery from the dataset', () => {
    const sheet = createSheet()
    resetStore({ sheet })

    render(<CharacterSheet />)

    const select = screen.getByLabelText('Misery list') as HTMLSelectElement
    fireEvent.change(select, { target: { value: miseries[0] } })
    fireEvent.click(screen.getByRole('button', { name: 'Add misery' }))

    const stored = useGameContext.getState().state.sheet.miseries
    expect(stored).toContain(miseries[0])
  })

  it('adds a custom misery', () => {
    const sheet = createSheet()
    resetStore({ sheet })

    render(<CharacterSheet />)

    const input = screen.getByLabelText('Custom misery') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'The sun refuses to rise' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add custom misery' }))

    const stored = useGameContext.getState().state.sheet.miseries
    expect(stored).toContain('The sun refuses to rise')
  })

  it('renders miseries below gear and uses compact remove labels', () => {
    const sheet = createSheet()
    resetStore({ sheet })

    render(<CharacterSheet />)

    const gearHeading = screen.getByText('Gear')
    const miseriesHeading = screen.getByText('Miseries')

    const position = gearHeading.compareDocumentPosition(miseriesHeading)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Custom misery'), { target: { value: 'Ash falls forever' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add custom misery' }))

    const removeButton = screen.getByRole('button', { name: 'Remove misery: Ash falls forever' })
    expect(removeButton.textContent).toBe('x')
  })
})
