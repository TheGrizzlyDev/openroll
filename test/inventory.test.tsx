import { render, fireEvent, cleanup, within } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange }: { value: string; onChange: (_v: string) => void }) => (
    <textarea value={value} onChange={e => onChange(e.target.value)} />
  )
}))
import Inventory, { reorderScrolls } from '../src/morg_borg/Inventory'
import {
  useGameContext,
  type InventoryItem,
  type Scroll,
  type GameState,
  type GameContextValue
} from '../src/GameContext'
import { Sheet } from '../src/morg_borg/sheet'
import { renderOml } from '../src/oml/render'

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
  notes: '',
  conditions: []
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
  it('focuses first input when popup opens', () => {
    resetStore()
    const { getAllByText, getAllByPlaceholderText } = render(<Inventory />)
    fireEvent.click(getAllByText('Add')[0])
    const nameInput = getAllByPlaceholderText('Name')[0]
    expect(document.activeElement).toBe(nameInput)
  })

  it('adds items', () => {
    const logInventory = vi.fn()
    resetStore({}, { logInventory })
    const { getAllByPlaceholderText, getByPlaceholderText, getAllByText, container } = render(<Inventory />)
    fireEvent.click(getAllByText('Add')[0])
    fireEvent.change(getAllByPlaceholderText('Name')[0], {
      target: { value: 'Sword' }
    })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '2' } })
    const editBtn = getAllByText('Edit')[0]
    fireEvent.click(editBtn)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Sharp' } })
    fireEvent.click(getAllByText('Save')[0])
    const itemPopup = container.querySelector('.overlay.show') as HTMLElement
    const addItemBtn = within(itemPopup).getByText('Add')
    fireEvent.click(addItemBtn)
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
    const { getByPlaceholderText, getAllByText, container } = render(<Inventory />)
    fireEvent.click(getAllByText('Add')[1])
    fireEvent.change(getByPlaceholderText('Name'), {
      target: { value: 'Fireball' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '3' } })
    const scrollPopup = container.querySelector('.overlay') as HTMLElement
    const addScrollBtn = within(scrollPopup).getByText('Add')
    fireEvent.click(addScrollBtn)
    const scrolls = useGameContext.getState().state.scrolls
    expect(scrolls).toEqual([expect.objectContaining({ name: 'Fireball', casts: 3 })])
    expect(logInventory).toHaveBeenCalledWith('Added unclean scroll Fireball (3)')
  })

  it('renders existing scroll notes and rolls dice', () => {
    const roll = vi.fn()
    const scrolls: Scroll[] = [
      { id: 1, type: 'unclean', name: 'Zap', casts: 1, notes: 'Power [dice "1d6" 1d6]' }
    ]
    resetStore({ scrolls }, { roll })
    const { getByText } = render(<Inventory />)
    const diceBtn = getByText('1d6')
    fireEvent.click(diceBtn)
    expect(roll).toHaveBeenCalledWith('1d6')
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

    fireEvent.click(getAllByText('Add')[0])
    fireEvent.change(getAllByPlaceholderText('Name')[0], {
      target: { value: 'Torch' }
    })
    fireEvent.change(getByPlaceholderText('Qty'), { target: { value: '1' } })
    fireEvent.click(getAllByText('Edit')[0])
    const itemTextarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(itemTextarea, { target: { value: '[dice "1d4" 1d4] damage' } })
    fireEvent.click(getAllByText('Save')[0])
    const itemPopup = container.querySelector('.overlay.show') as HTMLElement
    const addItemBtn = within(itemPopup).getByText('Add')
    fireEvent.click(addItemBtn)

    const itemDice = getByText('1d4')
    fireEvent.click(itemDice)
    expect(roll).toHaveBeenCalledWith('1d4')

    fireEvent.click(getAllByText('Add')[1])
    fireEvent.change(getByPlaceholderText('Name'), {
      target: { value: 'Zap' }
    })
    fireEvent.change(getByPlaceholderText('Casts'), { target: { value: '2' } })
    fireEvent.click(getAllByText('Edit')[1])
    const scrollTextarea = container.querySelector('textarea') as HTMLTextAreaElement
    fireEvent.change(scrollTextarea, { target: { value: '[dice "1d6" 1d6] damage' } })
    fireEvent.click(getByText('Save'))
    const scrollPopup = container.querySelector('.overlay') as HTMLElement
    const addScrollBtn = within(scrollPopup).getByText('Add')
    fireEvent.click(addScrollBtn)

    const scrollDice = getByText('1d6')
    fireEvent.click(scrollDice)
    expect(roll).toHaveBeenCalledWith('1d6')
  })

  it('renders dice badges for preloaded item notes', () => {
    const roll = vi.fn()
    const items: InventoryItem[] = [
      { id: 1, name: 'Sword', qty: 1, notes: '[dice "1d6" 1d6] damage' }
    ]
    resetStore({ inventory: items }, { roll })
    const { getByText } = render(<Inventory />)

    const itemDice = getByText('1d6')
    fireEvent.click(itemDice)
    expect(roll).toHaveBeenCalledWith('1d6')
  })

  it('renders draggable handle with button role for items', async () => {
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

  })

  it('reorders scrolls using arrayMove', () => {
    const scrolls: Scroll[] = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' },
      { id: 2, type: 'unclean', name: 'Zap', casts: 1, notes: '' }
    ]
    const reordered = reorderScrolls(scrolls, 1, 2)
    expect(reordered).toEqual([scrolls[1], scrolls[0]])
  })

  it('renders draggable handle with button role for scrolls', async () => {
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

  })
})

describe('Inventory lookup component', () => {
  it('filters items by type', () => {
    const inventory: InventoryItem[] = [
      { id: 1, name: 'Sword', qty: 1, notes: '' }
    ]
    const scrolls: Scroll[] = [
      { id: 1, type: 'unclean', name: 'Fireball', casts: 1, notes: '' }
    ]
    resetStore({ inventory, scrolls })
    const { getByText, queryByText } = render(
      <div>{renderOml('[inventory "Show" owned=true type="weapon"]', vi.fn())}</div>
    )
    fireEvent.click(getByText('Show'))
    expect(getByText('Sword')).toBeTruthy()
    expect(queryByText('Fireball')).toBeNull()
  })

  it('toggles popup visibility', () => {
    const inventory: InventoryItem[] = [
      { id: 1, name: 'Shield', qty: 1, notes: '' }
    ]
    resetStore({ inventory })
    const { getByText, container } = render(
      <div>{renderOml('[inventory "Open" owned=true type="weapon"]', vi.fn())}</div>
    )
    fireEvent.click(getByText('Open'))
    expect(getByText('Shield')).toBeTruthy()
    fireEvent.click(getByText('×'))
    expect(container.querySelector('.overlay')).toBeNull()
  })
})

