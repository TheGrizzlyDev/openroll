import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Inventory from '../src/Inventory'

describe('Inventory handlers', () => {
  it('adds items', () => {
    const onChange = vi.fn()
    const onLog = vi.fn()
    const { getByPlaceholderText, getByText } = render(
      <Inventory items={[]} onChange={onChange} onLog={onLog} />
    )
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'Sword' } })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '2' } })
    fireEvent.change(getByPlaceholderText('Notes'), { target: { value: 'Sharp' } })
    fireEvent.click(getByText('Add'))
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Sword', qty: 2, notes: 'Sharp' })
    ])
    expect(onLog).toHaveBeenCalledWith('Added Sword x2')
  })

  it('updates items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const onChange = vi.fn()
    const onLog = vi.fn()
    const { getByText, getByPlaceholderText } = render(
      <Inventory items={items} onChange={onChange} onLog={onLog} />
    )
    fireEvent.click(getByText('Edit'))
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '3' } })
    fireEvent.click(getByText('Save'))
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, name: 'Sword', qty: 3 })
    ])
    expect(onLog).toHaveBeenCalledWith('Updated Sword')
  })

  it('deletes items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const onChange = vi.fn()
    const onLog = vi.fn()
    const { getByText } = render(
      <Inventory items={items} onChange={onChange} onLog={onLog} />
    )
    fireEvent.click(getByText('Delete'))
    expect(onChange).toHaveBeenCalledWith([])
    expect(onLog).toHaveBeenCalledWith('Removed Sword')
  })
})
