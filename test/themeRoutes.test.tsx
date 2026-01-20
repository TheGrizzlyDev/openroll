import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../src/routes'
import AppThemeProvider from '../src/AppThemeProvider'
import { themes } from '../src/theme'
import { useSettingsStore } from '../src/stores/settingsStore'

const renderWithRoute = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AppThemeProvider>
        <AppRoutes />
      </AppThemeProvider>
    </MemoryRouter>
  )

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => { },
        removeEventListener: () => { },
        addListener: () => { },
        removeListener: () => { },
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
})

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState(), true)
  useSettingsStore.persist.clearStorage()
})

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('style')
})

describe('theme application by route', () => {
  it('forces Nexus routes to use Nexus dark tokens', async () => {
    useSettingsStore.setState({ theme: 'dark' })
    renderWithRoute('/roster')

    expect(await screen.findByRole('heading', { name: 'The Roster is Empty' })).toBeTruthy()

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe(
        themes.nexus.colors.bg
      )
    })
  })

  it('allows Realm routes to use settings theme tokens', async () => {
    useSettingsStore.setState({ theme: 'dark' })
    renderWithRoute('/generator')

    expect(
      await screen.findByRole('heading', { name: /BIRTH A WRETCH/ })
    ).toBeTruthy()

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe(
        themes.dark.colors.bg
      )
    })
  })
})
