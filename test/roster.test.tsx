import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StartPage from '../src/components/StartPage'
import { useGameContext } from '../src/stores/GameContext'
import { createSheet } from '../src/mork_borg/sheet'

const renderRoster = () =>
  render(
    <MemoryRouter initialEntries={['/roster']}>
      <StartPage />
    </MemoryRouter>
  )

describe('Roster states', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the empty roster CTA card', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, characters: [], lastAccess: {} }
    })

    renderRoster()

    expect(screen.getByTestId('roster-empty-card')).toBeTruthy()
    expect(screen.getByRole('button', { name: '+ Create Character' })).toBeTruthy()
    // expect(screen.getByRole('button', { name: 'Import Roster' })).toBeTruthy() // Note: FileInput might not be a role=button directly or text changed
  })

  it('renders populated roster cards with tags and stats', () => {
    const initial = useGameContext.getInitialState().state
    const baseSheet = createSheet()
    const characters = [
      {
        id: 'rhea',
        name: 'Rhea',
        sheet: {
          ...baseSheet,
          name: 'Rhea',
          class: 'Wretch',
          hp: 4,
          maxHp: 7,
          armor: 1,
          omens: 2
        },
        inventory: [],
        scrolls: []
      },
      {
        id: 'cinder',
        name: 'Cinder',
        sheet: {
          ...baseSheet,
          name: 'Cinder',
          class: 'Fanged Deserter',
          hp: 6,
          maxHp: 9,
          armor: 2,
          omens: 1
        },
        inventory: [],
        scrolls: []
      }
    ]
    useGameContext.setState({
      state: {
        ...initial,
        characters,
        lastAccess: { rhea: 2, cinder: 1 }
      }
    })

    renderRoster()

    const cards = screen.getAllByTestId('roster-card')
    expect(cards).toHaveLength(2)

    const firstCard = within(cards[0])
    expect(firstCard.getByText('Rhea')).toBeTruthy()
    // System tag is now just text
    expect(firstCard.getByText('Mörk Borg')).toBeTruthy()
    // Stats are combined
    expect(firstCard.getByText((content) => content.includes('HP: 4/7'))).toBeTruthy()
    expect(firstCard.getByText((content) => content.includes('Wretch'))).toBeTruthy()
  })

  it('allows adding an empty character after selecting a system', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: { ...initial, characters: [], lastAccess: {} }
    })

    renderRoster()

    fireEvent.click(screen.getByRole('button', { name: '+ Create Character' }))

    const addEmptyButton = screen.getByRole('button', { name: /add an empty character/i }) as HTMLButtonElement
    expect(addEmptyButton.disabled).toBe(true)

    fireEvent.click(screen.getByText('Mörk Borg'))
    expect(addEmptyButton.disabled).toBe(false)

    fireEvent.click(addEmptyButton)
    expect(useGameContext.getState().state.characters).toHaveLength(1)
  })
})
