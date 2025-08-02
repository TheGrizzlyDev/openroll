import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Inventory from '../src/Inventory'
import { GameContext } from '../src/GameContext'

const renderWithContext = (ui, { providerValue }) => {
  return render(
    <GameContext.Provider value={providerValue}>{ui}</GameContext.Provider>
  )
}

describe('Inventory handlers', () => {
  it('adds items', () => {
    const setInventory = vi.fn()
    const logInventory = vi.fn()
    const providerValue = { inventory: [], setInventory, logInventory }
    const { getByPlaceholderText, getByText } = renderWithContext(
      <Inventory />,
      { providerValue }
    )
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'Sword' } })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '2' } })
    fireEvent.change(getByPlaceholderText('Notes'), { target: { value: 'Sharp' } })
    fireEvent.click(getByText('Add'))
    expect(setInventory).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Sword', qty: 2, notes: 'Sharp' })
    ])
    expect(logInventory).toHaveBeenCalledWith('Added Sword x2')
  })

  it('updates items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const setInventory = vi.fn()
    const logInventory = vi.fn()
    const providerValue = { inventory: items, setInventory, logInventory }
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
    const providerValue = { inventory: items, setInventory, logInventory }
    const { getByText } = renderWithContext(<Inventory />, { providerValue })
    fireEvent.click(getByText('Delete'))
    expect(setInventory).toHaveBeenCalledWith([])
    expect(logInventory).toHaveBeenCalledWith('Removed Sword')
  })
})
