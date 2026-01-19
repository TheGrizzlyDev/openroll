import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('route destinations', () => {
  it('renders roster screen for /roster', async () => {
    renderWithRoute('/roster')

    expect(await screen.findByRole('heading', { name: 'Roster' })).toBeTruthy()
  })

  it('renders armory screen for /armory', async () => {
    renderWithRoute('/armory')

    expect(await screen.findByRole('heading', { name: 'Armory' })).toBeTruthy()
  })

  it('renders settings screen for /settings', async () => {
    renderWithRoute('/settings')

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy()
  })

  it('redirects the root route to roster', async () => {
    renderWithRoute('/')

    const rosterHeadings = await screen.findAllByRole('heading', { name: 'Roster' })
    expect(rosterHeadings.length).toBeGreaterThan(0)
  })
})
