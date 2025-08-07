import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import InventoryLookup from '../src/components/InventoryLookup'
import { useGameContext, type GameState, type InventoryItem } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

const resetStore = (state: Partial<GameState> = {}) => {
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
  useGameContext.setState({
    state: { ...base, ...state },
    overlayTimeout: null,
    logInventory: vi.fn(),
    roll: vi.fn()
  })
}

afterEach(() => {
  cleanup()
  resetStore()
})

describe('InventoryLookup overlay', () => {
  const item: InventoryItem = { id: 1, name: 'Sword', qty: 1, notes: '' }
  const attrs = { owned: 'true', type: 'inventory' }

  it('renders correctly', () => {
    resetStore()
    const { container } = render(
      <InventoryLookup description="Inventory" attrs={attrs} />
    )
    expect(container).toMatchSnapshot()
  })

  it('closes when close button clicked', () => {
    resetStore({ inventory: [item] })
    const { getByText, container } = render(
      <InventoryLookup description="Inventory" attrs={attrs} />
    )
    fireEvent.click(getByText('Inventory'))
    const closeBtn = getByText('×') as HTMLButtonElement
    expect(closeBtn.getAttribute('type')).toBe('button')
    fireEvent.click(closeBtn)
    expect(container.querySelector('.overlay')).toBeNull()
  })

  it('closes when an item is selected', () => {
    resetStore({ inventory: [item] })
    const { getByText, container } = render(
      <InventoryLookup description="Inventory" attrs={attrs} />
    )
    fireEvent.click(getByText('Inventory'))
    fireEvent.click(getByText('Sword'))
    expect(container.querySelector('.overlay')).toBeNull()
  })

  it('closes on Escape key press', () => {
    resetStore({ inventory: [item] })
    const { getByText, container } = render(
      <InventoryLookup description="Inventory" attrs={attrs} />
    )
    fireEvent.click(getByText('Inventory'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(container.querySelector('.overlay')).toBeNull()
  })

  it('closes on outside click', () => {
    resetStore({ inventory: [item] })
    const { getByText, container } = render(
      <InventoryLookup description="Inventory" attrs={attrs} />
    )
    fireEvent.click(getByText('Inventory'))
    fireEvent.mouseDown(document.body)
    expect(container.querySelector('.overlay')).toBeNull()
  })
})

