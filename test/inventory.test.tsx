import React from 'react'
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Inventory, { reorderScrolls } from '../src/morg_borg/Inventory'
import { GameContext, type GameContextValue, type InventoryItem, type Scroll } from '../src/GameContext'
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
      getAllByText,
      container
    } = renderWithContext(<Inventory />, {
      providerValue
    })
    fireEvent.change(getAllByPlaceholderText('Name')[0], {
      target: { value: 'Sword' }
    })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '2' } })
    const editBtn = getAllByText('Edit')[0]
    fireEvent.click(editBtn)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Sharp' } })
    fireEvent.click(getAllByText('Save')[0])
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
    const { getAllByText, getByPlaceholderText } = renderWithContext(
      <Inventory />,
      { providerValue }
    )
    const editItemBtn = getAllByText('Edit').find(btn => btn.closest('li'))
    fireEvent.click(editItemBtn!)
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Save')[0])
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

  it('renders dice in item and scroll notes and persists', () => {
    const roll = vi.fn()
    function Wrapper() {
      const [inventory, setInventory] = React.useState<InventoryItem[]>([])
      const [scrolls, setScrolls] = React.useState<Scroll[]>([])
      const providerValue: Partial<GameContextValue> = {
        inventory,
        setInventory,
        scrolls,
        setScrolls,
        logInventory: vi.fn(),
        sheet: createSimpleSheet(),
        roll
      }
      return (
        <GameContext.Provider value={providerValue as GameContextValue}>
          <Inventory />
        </GameContext.Provider>
      )
    }

    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText,
      container,
      getByText
    } = render(<Wrapper />)

    // add item with dice note
    fireEvent.change(getAllByPlaceholderText('Name')[0], {
      target: { value: 'Torch' }
    })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '1' } })
    fireEvent.click(getAllByText('Edit')[0])
    const itemTextarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(itemTextarea, { target: { value: 'Burn [dice 1d4]' } })
    fireEvent.click(getAllByText('Save')[0])
    fireEvent.click(getAllByText('Add')[0])

    const itemDice = getByText('1d4')
    fireEvent.click(itemDice)
    expect(roll).toHaveBeenCalledWith('1d4')

    // add scroll with dice note
    fireEvent.change(getAllByPlaceholderText('Name')[1], {
      target: { value: 'Zap' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '2' } })
    fireEvent.click(getAllByText('Edit')[1])
    const scrollTextarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(scrollTextarea, { target: { value: 'Power [dice 1d6]' } })
    fireEvent.click(getByText('Save'))
    fireEvent.click(getAllByText('Add')[1])

    const scrollDice = getByText('1d6')
    fireEvent.click(scrollDice)
    expect(roll).toHaveBeenCalledWith('1d6')
  })

  it('only starts dragging via the handle and toggles dragging class', async () => {
    const items = [
      { id: 1, name: 'Sword', qty: 1, notes: '' },
      { id: 2, name: 'Shield', qty: 1, notes: '' }
    ]
    const setInventory = vi.fn()
    const providerValue = {
      inventory: items,
      setInventory,
      logInventory: vi.fn(),
      scrolls: [],
      setScrolls: vi.fn(),
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const { container } = renderWithContext(<Inventory />, { providerValue })
    const firstItem = container.querySelector('li') as HTMLElement
    const handle = firstItem.querySelector('.drag-handle') as HTMLElement

    expect(firstItem.getAttribute('role')).toBeNull()
    expect(handle.getAttribute('role')).toBe('button')

    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstItem.classList.contains('dragging')).toBe(true),
    )
    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstItem.classList.contains('dragging')).toBe(false),
    )
  })

  it('reorders scrolls using arrayMove', () => {
    const scrolls = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' },
      { id: 2, type: 'unclean', name: 'Zap', casts: 1, notes: '' }
    ]
    const reordered = reorderScrolls(scrolls, 1, 2)
    expect(reordered).toEqual([scrolls[1], scrolls[0]])
  })

  it('only starts dragging scrolls via the handle and toggles dragging class', async () => {
    const scrolls = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' },
      { id: 2, type: 'unclean', name: 'Zap', casts: 1, notes: '' }
    ]
    const providerValue = {
      inventory: [],
      setInventory: vi.fn(),
      logInventory: vi.fn(),
      scrolls,
      setScrolls: vi.fn(),
      sheet: createSimpleSheet(),
      roll: vi.fn()
    }
    const { container } = renderWithContext(<Inventory />, { providerValue })
    const firstScroll = container.querySelector('.scrolls li') as HTMLElement
    const handle = firstScroll.querySelector('.drag-handle') as HTMLElement

    expect(firstScroll.getAttribute('role')).toBeNull()
    expect(handle.getAttribute('role')).toBe('button')

    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstScroll.classList.contains('dragging')).toBe(true),
    )
    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstScroll.classList.contains('dragging')).toBe(false),
    )
  })
})
