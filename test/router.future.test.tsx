import { render, cleanup, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, afterEach, beforeEach, expect } from 'vitest'
import AppRoutes from '../src/routes'
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
    overlay: { message: '', roll: null, visible: false },
    diceStyle: { color: '#ffffff', edgeColor: '#000000', textureUrls: [] }
  }
  useGameContext.setState({ state: initial, overlayTimeout: null })
}

describe('app routing with future flags', () => {
  beforeEach(() => {
    setupStore()
  })

  afterEach(() => {
    cleanup()
    setupStore()
    localStorage.clear()
  })

  it('renders character select at /characters', async () => {
    window.history.pushState({}, '', '/characters')
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    )
    expect(await screen.findByText('Create New', {}, { timeout: 5000 })).toBeTruthy()
  })

  it('renders character generator at /generator', async () => {
    window.history.pushState({}, '', '/generator')
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    )
    expect(await screen.findByText('Character Generator', {}, { timeout: 5000 })).toBeTruthy()
  })

  it('renders sheet page at /sheet/:id', async () => {
    window.history.pushState({}, '', '/sheet/0')
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    )
    expect(await screen.findByText('Characters', {}, { timeout: 5000 })).toBeTruthy()
  })

  it('renders log view at /log', async () => {
    window.history.pushState({}, '', '/log')
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    )
    expect(await screen.findByText('Clear Log', {}, { timeout: 5000 })).toBeTruthy()
  })
})
