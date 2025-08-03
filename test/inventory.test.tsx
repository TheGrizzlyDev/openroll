import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Inventory from '../src/morg_borg/Inventory'
import { GameContext, type GameContextValue } from '../src/GameContext'
import { Sheet } from '../src/morg_borg/sheet'

const renderWithContext = (
  ui: React.ReactElement,
  { providerValue }: { providerValue: Partial<GameContextValue> }
) => {
  return render(
    <GameContext.Provider value={providerValue as GameContextValue}>{ui}</GameContext.Provider>
  )
}

const createSimpleSheet = () : Sheet => ({ 
  name: '',
  class: '',
  str: 0,
  agi: 0,
  pre: 0,
  tou: 0,
  statDice: {
    str: '1d20',
    agi: '1d20',
    pre: '1d20',
    tou: '1d20',
  },
  hp: 1,
  maxHp: 1,
  armor: 0,
  omens: 0,
  silver: 0,
  notes: "",
})

afterEach(() => cleanup())

describe('Inventory handlers', () => {
  it('adds items', () => {
    const setInventory = vi.fn()
    const logInventory = vi.fn()
    const providerValue = {
      inventory: [],
      setInventory,
      logInventory,
      scrolls: [],
      setScrolls: vi.fn(),
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText
    } = renderWithContext(<Inventory />, {
      providerValue
    })
    fireEvent.change(getAllByPlaceholderText('Name')[0], {
      target: { value: 'Sword' }
    })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '2' } })
    fireEvent.change(getAllByPlaceholderText('Notes')[0], {
      target: { value: 'Sharp' }
    })
    fireEvent.click(getAllByText('Add')[0])
    expect(setInventory).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Sword', qty: 2, notes: 'Sharp' })
    ])
    expect(logInventory).toHaveBeenCalledWith('Added Sword x2')
  })

  it('updates items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const setInventory = vi.fn()
    const logInventory = vi.fn()
    const providerValue = {
      inventory: items,
      setInventory,
      logInventory,
      scrolls: [],
      setScrolls: vi.fn(),
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const { getByText, getByPlaceholderText } = renderWithContext(
      <Inventory />,
      { providerValue }
    )
    fireEvent.click(getByText('Edit'))
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '3' } })
    fireEvent.click(getByText('Save'))
    expect(setInventory).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, name: 'Sword', qty: 3 })
    ])
    expect(logInventory).toHaveBeenCalledWith('Updated Sword')
  })

  it('deletes items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const setInventory = vi.fn()
    const logInventory = vi.fn()
    const providerValue = {
      inventory: items,
      setInventory,
      logInventory,
      scrolls: [],
      setScrolls: vi.fn(),
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const { getByText } = renderWithContext(<Inventory />, { providerValue })
    fireEvent.click(getByText('Delete'))
    expect(setInventory).toHaveBeenCalledWith([])
    expect(logInventory).toHaveBeenCalledWith('Removed Sword')
  })

  it('adds scrolls', () => {
    const setScrolls = vi.fn()
    const logInventory = vi.fn()
    const providerValue = {
      inventory: [],
      setInventory: vi.fn(),
      logInventory,
      scrolls: [],
      setScrolls,
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText
    } = renderWithContext(<Inventory />, { providerValue })

    fireEvent.change(getAllByPlaceholderText('Name')[1], {
      target: { value: 'Fireball' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Add')[1])

    expect(setScrolls).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Fireball', casts: 3 })
    ])
    expect(logInventory).toHaveBeenCalledWith(
      'Added unclean scroll Fireball (3)'
    )
  })
})
