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
    const { container } = render(
      <MemoryRouter initialEntries={['/sheet/0']}>
        <Routes>
          <Route path="/sheet/:id" element={<SheetPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(container).toMatchSnapshot()
  })

  it('switches to notes tab', () => {
    setupStore()
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={['/sheet/0']}>
        <Routes>
          <Route path="/sheet/:id" element={<SheetPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(queryByText('Edit')).toBeNull()
    fireEvent.click(getByText('Notes'))
    expect(useGameContext.getState().state.activeTab).toBe('notes')
    expect(getByText('Edit')).toBeTruthy()
  })
})
