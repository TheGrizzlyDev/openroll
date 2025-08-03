import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Inventory from '../src/Inventory'
import { GameContext } from '../src/GameContext'

const renderWithContext = (ui: React.ReactElement, { providerValue }: { providerValue: any }) => {
  return render(
    <GameContext.Provider value={providerValue}>{ui}</GameContext.Provider>
  )
}

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
      sheet: { pre: 0 },
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
      sheet: { pre: 0 },
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
      sheet: { pre: 0 },
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
      sheet: { pre: 0 },
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
