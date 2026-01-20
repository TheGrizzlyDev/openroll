import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../src/routes'

const renderWithRoute = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>
  )

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
})

afterEach(() => {
  cleanup()
})

describe('route destinations', () => {
  it('renders roster screen for /roster', async () => {
    renderWithRoute('/roster')

    expect(await screen.findByRole('heading', { name: 'Roster' })).toBeTruthy()
  })

  it('renders armory screen for /armory', async () => {
    renderWithRoute('/armory')

    expect(await screen.findByRole('heading', { name: 'Armory' })).toBeTruthy()
    expect(await screen.findByTestId('under-construction')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Under Construction' })).toBeTruthy()
  })

  it('renders settings screen for /settings', async () => {
    renderWithRoute('/settings')

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy()
    expect(await screen.findByTestId('under-construction')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Under Construction' })).toBeTruthy()
  })

  it('redirects the root route to roster', async () => {
    renderWithRoute('/')

    const rosterHeadings = await screen.findAllByRole('heading', { name: 'Roster' })
    expect(rosterHeadings.length).toBeGreaterThan(0)
  })
})

describe('navbar visibility', () => {
  it('renders three bottom nav items with expected labels', async () => {
    renderWithRoute('/roster')

    const nav = await screen.findByTestId('nexus-nav')
    const navButtons = within(nav).getAllByRole('button')
    expect(navButtons).toHaveLength(3)
    expect(navButtons.map(button => button.textContent?.trim())).toEqual([
      'Roster',
      'Armory',
      'Settings',
    ])
  })

  it('renders navbar buttons on Nexus routes', async () => {
    renderWithRoute('/roster')

    expect(await screen.findByRole('button', { name: 'Armory' })).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Settings' })).toBeTruthy()
  })

  it('hides navbar buttons on Realm routes', async () => {
    renderWithRoute('/generator')

    expect(await screen.findByRole('heading', { name: /Character Generator/ }))
      .toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Armory' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Settings' })).toBeNull()
  })
})
