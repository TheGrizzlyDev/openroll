import { render, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Inventory, { reorderScrolls } from '../src/morg_borg/Inventory'
import {
  useGameContext,
  type InventoryItem,
  type Scroll,
  type GameState,
  type GameContextValue
} from '../src/GameContext'
import { Sheet } from '../src/morg_borg/sheet'

const createSimpleSheet = (): Sheet => ({
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
    tou: '1d20'
  },
  hp: 1,
  maxHp: 1,
  armor: 0,
  omens: 0,
  silver: 0,
  trait: '',
  background: '',
  notes: ''
})

const resetStore = (
  state: Partial<GameState> = {},
  mocks: {
    logInventory?: GameContextValue['logInventory']
    roll?: GameContextValue['roll']
  } = {}
) => {
  const base: GameState = {
    characters: [],
    current: null,
    sheet: createSimpleSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', visible: false }
  }
  useGameContext.setState({
    state: { ...base, ...state },
    overlayTimeout: null,
    logInventory: mocks.logInventory ?? vi.fn(),
    roll: mocks.roll ?? vi.fn()
  })
}

afterEach(() => {
  cleanup()
  resetStore()
})

describe('Inventory handlers', () => {
  it('adds items', () => {
    const logInventory = vi.fn()
    resetStore({}, { logInventory })
    const { getAllByPlaceholderText, getByPlaceholderText, getAllByText, container } = render(<Inventory />)
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
    const items = useGameContext.getState().state.inventory
    expect(items).toEqual([
      expect.objectContaining({ name: 'Sword', qty: 2, notes: 'Sharp' })
    ])
    expect(logInventory).toHaveBeenCalledWith('Added Sword x2')
  })

  it('updates items', () => {
    const items: InventoryItem[] = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const logInventory = vi.fn()
    resetStore({ inventory: items }, { logInventory })
    const { getAllByText, getByPlaceholderText } = render(<Inventory />)
    const editItemBtn = getAllByText('Edit').find(btn => btn.closest('li'))
    fireEvent.click(editItemBtn!)
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Save')[0])
    const stateItems = useGameContext.getState().state.inventory
    expect(stateItems).toEqual([
      expect.objectContaining({ id: 1, name: 'Sword', qty: 3 })
    ])
    expect(logInventory).toHaveBeenCalledWith('Updated Sword')
  })

  it('deletes items', () => {
    const items: InventoryItem[] = [{ id: 1, name: 'Sword', qty: 1, notes: '' }]
    const logInventory = vi.fn()
    resetStore({ inventory: items }, { logInventory })
    const { getByText } = render(<Inventory />)
    fireEvent.click(getByText('Delete'))
    const stateItems = useGameContext.getState().state.inventory
    expect(stateItems).toEqual([])
    expect(logInventory).toHaveBeenCalledWith('Removed Sword')
  })

  it('adds scrolls', () => {
    const logInventory = vi.fn()
    resetStore({}, { logInventory })
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText
    } = render(<Inventory />)
    fireEvent.change(getAllByPlaceholderText('Name')[1], {
      target: { value: 'Fireball' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '3' } })
    fireEvent.click(getAllByText('Add')[1])
    const scrolls = useGameContext.getState().state.scrolls
    expect(scrolls).toEqual([expect.objectContaining({ name: 'Fireball', casts: 3 })])
    expect(logInventory).toHaveBeenCalledWith('Added unclean scroll Fireball (3)')
  })

  it('renders dice in item and scroll notes and persists', () => {
    const roll = vi.fn()
    resetStore({}, { roll })
    const {
      getAllByPlaceholderText,
      getByPlaceholderText,
      getAllByText,
      container,
      getByText
    } = render(<Inventory />)

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
    const items: InventoryItem[] = [
      { id: 1, name: 'Sword', qty: 1, notes: '' },
      { id: 2, name: 'Shield', qty: 1, notes: '' }
    ]
    resetStore({ inventory: items })
    const { container } = render(<Inventory />)
    const firstItem = container.querySelector('li') as HTMLElement
    const handle = firstItem.querySelector('.drag-handle') as HTMLElement

    expect(firstItem.getAttribute('role')).toBeNull()
    expect(handle.getAttribute('role')).toBe('button')

    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstItem.classList.contains('dragging')).toBe(true)
    )
    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstItem.classList.contains('dragging')).toBe(false)
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
    resetStore({ scrolls })
    const { container } = render(<Inventory />)
    const firstScroll = container.querySelector('.scrolls li') as HTMLElement
    const handle = firstScroll.querySelector('.drag-handle') as HTMLElement

    expect(firstScroll.getAttribute('role')).toBeNull()
    expect(handle.getAttribute('role')).toBe('button')

    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstScroll.classList.contains('dragging')).toBe(true)
    )
    fireEvent.keyDown(handle, { key: ' ', code: 'Space', keyCode: 32 })
    await waitFor(() =>
      expect(firstScroll.classList.contains('dragging')).toBe(false)
    )
  })
})

