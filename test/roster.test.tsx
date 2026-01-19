import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: 'Select a System' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Import Roster' })).toBeTruthy()
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
    expect(firstCard.getByTestId('roster-system-tag').textContent).toContain('Mörk Borg')
    expect(firstCard.getByTestId('roster-class-tag').textContent).toContain('Wretch')
    expect(firstCard.getByTestId('roster-stat-hp').textContent).toContain('4/7')
    expect(firstCard.getByTestId('roster-stat-omens').textContent).toContain('2')
    expect(firstCard.getByTestId('roster-stat-armor').textContent).toContain('1')
  })
})
