import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SheetPage from '../src/components/SheetPage'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/mork_borg/sheet'

const setupStore = () => {
  const initial: GameState = {
    characters: [],
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', roll: null, visible: false },
    diceStyle: { color: '#ffffff', edgeColor: '#000000', textureUrls: [] }
  }
  useGameContext.setState({ state: initial, overlayTimeout: null })
}

afterEach(() => {
  cleanup()
  setupStore()
  localStorage.clear()
})

describe('SheetPage navigation', () => {
  it('renders correctly', () => {
    setupStore()
    render(
      <MemoryRouter initialEntries={['/sheet/0']}>
        <Routes>
          <Route path="/sheet/:id" element={<SheetPage />} />
        </Routes>
      </MemoryRouter>
    )
  })

  it('switches to notes tab', () => {
    setupStore()
    const { getByRole, queryByText } = render(
      <MemoryRouter initialEntries={['/sheet/0']}>
        <Routes>
          <Route path="/sheet/:id" element={<SheetPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(queryByText('Edit')).toBeNull()
    const notesTab = getByRole('tab', { name: 'Notes' })
    fireEvent.click(notesTab)
    expect(useGameContext.getState().state.activeTab).toBe('notes')
    expect(notesTab.getAttribute('aria-selected')).toBe('true')
    expect(getByRole('button', { name: 'Edit' })).toBeTruthy()
  })
})
