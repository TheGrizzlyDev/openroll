import { render, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SheetPage from '../src/components/SheetPage'
import { useGameContext, type GameState } from '../src/GameContext'
import { createSheet } from '../src/morg_borg/sheet'

const setupStore = () => {
  const initial: GameState = {
    characters: [],
    current: null,
    sheet: createSheet(),
    inventory: [],
    scrolls: [],
    log: [],
    activeTab: 'character',
    overlay: { message: '', visible: false }
  }
  useGameContext.setState({ state: initial, overlayTimeout: null })
}

afterEach(() => {
  cleanup()
  setupStore()
  localStorage.clear()
})

describe('SheetPage navigation', () => {
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
