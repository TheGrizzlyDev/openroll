import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CharacterSheet from '../src/mork_borg/CharacterSheet'
import { createSheet } from '../src/mork_borg/sheet'
import { useGameContext, type GameState } from '../src/stores/GameContext'
import styles from '../src/mork_borg/CharacterSheet.module.css'

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

describe('CharacterSheet gear section', () => {
  it('keeps gear actions inline with the item name', () => {
    const sheet = createSheet()
    const inventory = [
      { id: 1, name: 'Torch', qty: 1, notes: 'Burns bright.' }
    ]
    resetStore({ sheet, inventory })

    render(<CharacterSheet />)

    const gearSection = screen.getByText('Gear').closest(`.${styles.gearSection}`) as HTMLElement | null
    const gearQueries = within(gearSection ?? document.body)
    const nameHeading = gearQueries.getByRole('heading', { name: 'Torch' })
    const editButton = gearQueries.getByRole('button', { name: '✎' })
    const removeButton = gearQueries.getByRole('button', { name: '🗑' })
    const header = nameHeading.closest(`.${styles.gearHeader}`) as HTMLElement | null

    expect(header).not.toBeNull()
    expect(header?.contains(editButton)).toBe(true)
    expect(header?.contains(removeButton)).toBe(true)
  })
})
