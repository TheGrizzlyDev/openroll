import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CharacterGenerator from '../src/mork_borg/components/CharacterGenerator'
import { useGameContext } from '../src/stores/GameContext'
import { createSheet } from '../src/mork_borg/sheet'

const renderGenerator = () =>
  render(
    <MemoryRouter initialEntries={['/generator']}>
      <CharacterGenerator />
    </MemoryRouter>
  )

describe('Character generator layout', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the forging header and action buttons', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: {
        ...initial,
        sheet: createSheet(),
        inventory: [],
        scrolls: []
      }
    })

    renderGenerator()

    expect(screen.getByRole('button', { name: /roster/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /reroll all/i })).toBeTruthy()
    expect(screen.getByText('FORGING NEW SCUM')).toBeTruthy()
  })

  it('rerolls the character when clicking reroll all', () => {
    const initial = useGameContext.getInitialState().state
    useGameContext.setState({
      state: {
        ...initial,
        sheet: createSheet(),
        inventory: [],
        scrolls: []
      }
    })

    const store = useGameContext.getState()
    const spy = vi.spyOn(store, 'createCharacter')

    renderGenerator()

    fireEvent.click(screen.getByRole('button', { name: /reroll all/i }))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('shows vitality, armor, and finalize action', () => {
    const initial = useGameContext.getInitialState().state
    const sheet = createSheet()
    sheet.hp = 9
    sheet.maxHp = 20
    sheet.armor = 1
    sheet.str = 2
    sheet.agi = -1
    sheet.pre = 0
    sheet.tou = 3
    useGameContext.setState({
      state: {
        ...initial,
        sheet,
        inventory: [],
        scrolls: []
      }
    })

    renderGenerator()

    expect(screen.getByText('VITALITY')).toBeTruthy()
    expect(screen.getByText('09')).toBeTruthy()
    expect(screen.getByText('/')).toBeTruthy()
    expect(screen.getByText('20')).toBeTruthy()
    expect(screen.getByText('ARMOR')).toBeTruthy()
    expect(screen.getByText('TIER 1')).toBeTruthy()
    expect(screen.getByRole('button', { name: /finalize/i })).toBeTruthy()
  })
})
