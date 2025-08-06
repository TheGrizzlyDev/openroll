import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderOml } from '../src/oml/render'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

const setup = (state?: Partial<GameState>) => {
  const base: GameState = {
    characters: [],
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', visible: false }
  }
  useGameContext.setState({ state: { ...base, ...state }, overlayTimeout: null })
}

describe('apply effect handler', () => {
  beforeEach(() => setup())

  it('applies hp changes', () => {
    setup({ sheet: { ...createSheet(), hp: 10 } })
    const Test = () => <div>{renderOml('[apply "Fall" hp -1]')}</div>
    const { getByText } = render(<Test />)
    fireEvent.click(getByText('Fall'))
    const { state } = useGameContext.getState()
    expect(state.sheet.hp).toBe(9)
  })

  it('applies stat changes', () => {
    const Test = () => <div>{renderOml('[apply "Buff" str +2]')}</div>
    const { getByText } = render(<Test />)
    fireEvent.click(getByText('Buff'))
    const { state } = useGameContext.getState()
    expect(state.sheet.str).toBe(2)
  })

  it('applies item changes', () => {
    setup({ inventory: [{ id: 1, name: 'Potion', qty: 1, notes: '' }] })
    const Test = () => <div>{renderOml('[apply "Drink" item Potion -1]')}</div>
    const { getByText } = render(<Test />)
    fireEvent.click(getByText('Drink'))
    const { state } = useGameContext.getState()
    expect(state.inventory.find(i => i.name === 'Potion')?.qty).toBe(0)
  })

  it('applies condition changes', () => {
    const Test = () => (
      <div>{renderOml('[apply "Poison" condition poisoned add]')}</div>
    )
    const { getByText } = render(<Test />)
    fireEvent.click(getByText('Poison'))
    const { state } = useGameContext.getState()
    expect(state.sheet.conditions).toContain('poisoned')
  })
})
