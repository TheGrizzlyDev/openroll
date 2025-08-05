import React from 'react'
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Inventory, { reorderScrolls } from '../src/morg_borg/Inventory'
import {
  GameContext,
  type GameContextValue,
  type InventoryItem,
  type Scroll,
  type GameState,
  type GameAction
} from '../src/GameContext'
import { Sheet } from '../src/morg_borg/sheet'

const renderWithContext = (
  ui: React.ReactElement,
  {
    providerValue
  }: {
    providerValue: {
      inventory: InventoryItem[]
      scrolls: Scroll[]
      sheet: Sheet
      logInventory: GameContextValue['logInventory']
      roll: GameContextValue['roll']
    }
  }
) => {
  let dispatchMock: ReturnType<typeof vi.fn> = vi.fn(() => {});

  function Wrapper() {
    const [state, setState] = React.useState<GameState>({
      characters: [],
      current: null,
      sheet: providerValue.sheet,
      inventory: providerValue.inventory,
      scrolls: providerValue.scrolls,
      log: [],
      activeTab: 'character',
      overlay: { message: '', visible: false }
    })

    dispatchMock = vi.fn((action: GameAction) => {
      switch (action.type) {
        case 'SET_INVENTORY':
          setState(prev => ({ ...prev, inventory: action.inventory }))
          break
        case 'SET_SCROLLS':
          setState(prev => ({ ...prev, scrolls: action.scrolls }))
          break
        case 'SET_SHEET':
          setState(prev => ({ ...prev, sheet: action.sheet }))
          break
        default:
          break
      }
    })

    const value: GameContextValue = {
      state,
      dispatch: dispatchMock,
      overlayTimeout: { current: null },
      loadCharacter: vi.fn(),
      createCharacter: vi.fn(),
      finalizeCharacter: vi.fn(),
      cancelCreation: vi.fn(),
      deleteCharacter: vi.fn(),
      exportCharacters: () => '',
      importCharacters: () => false,
      roll: providerValue.roll,
      logInventory: providerValue.logInventory
    }
    return <GameContext.Provider value={value}>{ui}</GameContext.Provider>
  }

  const result = render(<Wrapper />)
  return { ...result, dispatch: dispatchMock }
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
    const logInventory = vi.fn()
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText,
      container,
      dispatch
    } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: [],
        scrolls: [],
        sheet: createSimpleSheet(),
        logInventory,
        roll: vi.fn()
      }
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
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INVENTORY',
      inventory: [
        expect.objectContaining({ name: 'Sword', qty: 2, notes: 'Sharp' })
      ]
    })
    expect(logInventory).toHaveBeenCalledWith('Added Sword x2')
  })

  it('updates items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const logInventory = vi.fn()
    const { getAllByText, getByPlaceholderText, dispatch } = renderWithContext(
      <Inventory />,
      {
        providerValue: {
          inventory: items,
          scrolls: [],
          sheet: createSimpleSheet(),
          logInventory,
          roll: vi.fn()
        }
      }
    )
    const editItemBtn = getAllByText('Edit').find(btn => btn.closest('li'))
    fireEvent.click(editItemBtn!)
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Save')[0])
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INVENTORY',
      inventory: [
        expect.objectContaining({ id: 1, name: 'Sword', qty: 3 })
      ]
    })
    expect(logInventory).toHaveBeenCalledWith('Updated Sword')
  })

  it('deletes items', () => {
    const items = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const logInventory = vi.fn()
    const { getByText, dispatch } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: items,
        scrolls: [],
        sheet: createSimpleSheet(),
        logInventory,
        roll: vi.fn()
      }
    })
    fireEvent.click(getByText('Delete'))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_INVENTORY',
      inventory: []
    })
    expect(logInventory).toHaveBeenCalledWith('Removed Sword')
  })

  it('adds scrolls', () => {
    const logInventory = vi.fn()
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText,
      dispatch
    } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: [],
        scrolls: [],
        sheet: createSimpleSheet(),
        logInventory,
        roll: vi.fn()
      }
    })

    fireEvent.change(getAllByPlaceholderText('Name')[1], {
      target: { value: 'Fireball' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Add')[1])

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SCROLLS',
      scrolls: [expect.objectContaining({ name: 'Fireball', casts: 3 })]
    })
    expect(logInventory).toHaveBeenCalledWith(
      'Added unclean scroll Fireball (3)'
    )
  })

  it('renders dice in item and scroll notes and persists', () => {
    const roll = vi.fn()
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText,
      container,
      getByText
    } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: [],
        scrolls: [],
        sheet: createSimpleSheet(),
        logInventory: vi.fn(),
        roll
      }
    })

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
    const { container } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: items,
        scrolls: [],
        sheet: createSimpleSheet(),
        logInventory: vi.fn(),
        roll: vi.fn()
      }
    })
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
    const scrolls: Scroll[] = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' },
      { id: 2, type: 'unclean', name: 'Zap', casts: 1, notes: '' }
    ]
    const reordered = reorderScrolls(scrolls, 1, 2)
    expect(reordered).toEqual([scrolls[1], scrolls[0]])
  })

  it('only starts dragging scrolls via the handle and toggles dragging class', async () => {
    const scrolls: Scroll[] = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' },
      { id: 2, type: 'unclean', name: 'Zap', casts: 1, notes: '' }
    ]
    const { container } = renderWithContext(<Inventory />, {
      providerValue: {
        inventory: [],
        scrolls,
        sheet: createSimpleSheet(),
        logInventory: vi.fn(),
        roll: vi.fn()
      }
    })
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
